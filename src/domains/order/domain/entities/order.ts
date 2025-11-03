import { AggregateRoot } from '../../../../shared/domain/entities/base';
import { Id } from '../../../../shared/domain/value-objects/common';
import { OrderStatus } from '../value-objects/order-status';
import { OrderStateMachineService } from '../services/order-state-mechine-service';
import { OrderItem } from '../value-objects/order-item';
import { BusinessRuleError } from '../../../../shared/application/exceptions';
import { DomainEvent } from '../../../../shared/domain/events/domain-event';

// 訂單 ID 值物件
export class OrderId extends Id {
  constructor(value: string) {
    super(value);
  }
}

// 用戶 ID 值物件
export class UserId extends Id {
  constructor(value: string) {
    super(value);
  }
}

// 領域事件
export class OrderCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string = 'OrderCreated';
  readonly aggregateId: string;

  constructor(public readonly orderId: string, public readonly userId: string) {
    this.occurredOn = new Date();
    this.aggregateId = orderId;
  }
}

export class OrderStatusChangedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string = 'OrderStatusChanged';
  readonly aggregateId: string;

  constructor(
    public readonly orderId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string
  ) {
    this.occurredOn = new Date();
    this.aggregateId = orderId;
  }
}

export class OrderCancelledEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string = 'OrderCancelled';
  readonly aggregateId: string;

  constructor(
    public readonly orderId: string,
    public readonly cancelledBy: 'user' | 'counter'
  ) {
    this.occurredOn = new Date();
    this.aggregateId = orderId;
  }
}

// 訂單聚合根
export class Order extends AggregateRoot<OrderId> {
  /**
   * 是否可取消（委派狀態機服務）
   */
  public canBeCancelled(): boolean {
    return OrderStateMachineService.prototype.canBeCancelled(this);
  }

  /**
   * 是否處理中（委派狀態機服務）
   */
  public isInProgress(): boolean {
    return OrderStateMachineService.prototype.isInProgress(this);
  }
  private _userId: UserId;
  private _status: OrderStatus;
  private _items: OrderItem[];
  private _createdAt: Date;
  private _updatedAt: Date;
  private _cancelledBy?: 'user' | 'counter' | null;
  private _errorMessage?: string | null;

  constructor(
    id: OrderId,
    userId: UserId,
    items: OrderItem[],
    status?: OrderStatus,
    createdAt?: Date,
    updatedAt?: Date,
    cancelledBy?: 'user' | 'counter' | null,
    errorMessage?: string | null
  ) {
    super(id);

    if (!items || items.length === 0) {
      throw new BusinessRuleError('訂單必須包含至少一項餐點');
    }

    this._userId = userId;
    this._items = [...items];
    this._status = status || OrderStatus.已點餐;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._cancelledBy = cancelledBy;
    this._errorMessage = errorMessage;

    // 如果是新建立的訂單，發布事件
    if (!status) {
      this.addDomainEvent(new OrderCreatedEvent(id.value, userId.value));
    }
  }

  // 靜態工廠方法：建立新訂單
  public static create(userId: UserId, items: OrderItem[]): Order {
    const orderId = new OrderId(Id.generate().value);
    return new Order(orderId, userId, items);
  }

  // Getters
  get userId(): UserId {
    return this._userId;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get items(): readonly OrderItem[] {
    return this._items;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get cancelledBy(): 'user' | 'counter' | null | undefined {
    return this._cancelledBy;
  }

  get errorMessage(): string | null | undefined {
    return this._errorMessage;
  }

  get totalAmount(): number {
    return this._items.reduce((total, item) => total + item.totalPrice, 0);
  }

  /**
   * 狀態轉換（內部使用）
   * @param newStatus 新狀態
   * @throws BusinessRuleError 狀態轉換不合法時
   */
  public transitionTo(newStatus: OrderStatus): void {
    // 使用 OrderStateMachineService 進行狀態轉換驗證
    OrderStateMachineService.prototype.validateTransition(this, newStatus);

    const previousStatus = this._status.value;
    this._status = newStatus;
    this._updatedAt = new Date();
    this._errorMessage = null; // 清除錯誤訊息

    this.addDomainEvent(new OrderStatusChangedEvent(
      this.id.value,
      previousStatus,
      newStatus.value
    ));
  }

  /**
   * 業務方法：取消訂單
   * 僅能於「已點餐」或「已確認訂單」狀態取消訂單
   * @param cancelledBy 取消者（user/counter）
   * @throws BusinessRuleError 狀態不符時
   */
  public cancel(cancelledBy: 'user' | 'counter'): void {

    if (!this.canBeCancelled()) {
      throw new BusinessRuleError('僅能於「已點餐」或「已確認訂單」狀態取消訂單');
    }

    this._status = OrderStatus.已取消;
    this._cancelledBy = cancelledBy;
    this._updatedAt = new Date();
    this._errorMessage = null;

    this.addDomainEvent(new OrderCancelledEvent(this.id.value, cancelledBy));
  }

  /**
   * 業務方法：完成訂單
   * 僅能於「可取餐」狀態完成訂單
   * @throws BusinessRuleError 狀態不符時
   */
  public setComplete(): void {
    if (this._status !== OrderStatus.可取餐) {
      throw new BusinessRuleError('僅能於「可取餐」狀態完成訂單');
    }

    this.transitionTo(OrderStatus.已取餐完成);
  }

  /**
   * 業務方法：標記失敗
   * 僅能於「製作中」狀態標記失敗
   * @param reason 失敗原因
   * @throws BusinessRuleError 狀態不符時
   */
  public setFail(reason: string): void {
    if (this._status !== OrderStatus.製作中) {
      throw new BusinessRuleError('僅能於「製作中」狀態標記失敗');
    }

    this._status = OrderStatus.製作失敗;
    this._updatedAt = new Date();
    this._errorMessage = reason;

    this.addDomainEvent(new OrderStatusChangedEvent(
      this.id.value,
      OrderStatus.製作中.value,
      OrderStatus.製作失敗.value
    ));
  }

  /**
   * 業務方法：確認訂單
   * 狀態轉換為「已確認訂單」
   * @throws BusinessRuleError 狀態轉換不合法時
   */
  public setConfirm(): void {
    this.transitionTo(OrderStatus.已確認訂單);
  }

  
  /**
   * 業務方法：開始製作
   * 狀態轉換為「製作中」
   * @throws BusinessRuleError 狀態轉換不合法時
   */
  public setStartPreparation(): void {
    this.transitionTo(OrderStatus.製作中);
  }

  /**
   * 業務方法：標記為可取餐
   * 狀態轉換為「可取餐」
   * @throws BusinessRuleError 狀態轉換不合法時
   */
  public setMarkReadyForPickup(): void {
    this.transitionTo(OrderStatus.可取餐);
  }
}