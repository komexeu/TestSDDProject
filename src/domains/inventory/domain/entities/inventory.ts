import { Entity, AggregateRoot } from '../../../../shared/domain/entities/base';
import { Id } from '../../../../shared/domain/value-objects/common';
import { StockQuantity, InventoryOperationType, Operator, OperationReason } from '../value-objects/inventory-properties';
import { BusinessRuleError } from '../../../../shared/application/exceptions';
import { DomainEvent } from '../../../../shared/domain/events/domain-event';

// 庫存 ID 值物件
export class InventoryId extends Id {
  constructor(value: string) {
    super(value);
  }
}

// 產品 ID 值物件（引用產品領域）
export class ProductId extends Id {
  constructor(value: string) {
    super(value);
  }
}

// 庫存日誌 ID 值物件
export class InventoryLogId extends Id {
  constructor(value: string) {
    super(value);
  }
}

// 領域事件
export class StockAdjustedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string = 'StockAdjusted';
  readonly aggregateId: string;

  constructor(
    public readonly productId: string,
    public readonly previousQuantity: number,
    public readonly newQuantity: number,
    public readonly operationType: string
  ) {
    this.occurredOn = new Date();
    this.aggregateId = productId;
  }
}

export class StockInsufficientEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string = 'StockInsufficient';
  readonly aggregateId: string;

  constructor(
    public readonly productId: string,
    public readonly requestedQuantity: number,
    public readonly availableQuantity: number
  ) {
    this.occurredOn = new Date();
    this.aggregateId = productId;
  }
}

// 庫存日誌實體
export class InventoryLog extends Entity<InventoryLogId> {
  private _productId: ProductId;
  private _beforeQuantity: StockQuantity;
  private _afterQuantity: StockQuantity;
  private _delta: number;
  private _operationType: InventoryOperationType;
  private _reason: OperationReason;
  private _operator: Operator;
  private _createdAt: Date;

  constructor(
    id: InventoryLogId,
    productId: ProductId,
    beforeQuantity: StockQuantity,
    afterQuantity: StockQuantity,
    operationType: InventoryOperationType,
    reason: OperationReason,
    operator: Operator,
    createdAt?: Date
  ) {
    super(id);
    this._productId = productId;
    this._beforeQuantity = beforeQuantity;
    this._afterQuantity = afterQuantity;
    this._delta = afterQuantity.value - beforeQuantity.value;
    this._operationType = operationType;
    this._reason = reason;
    this._operator = operator;
    this._createdAt = createdAt || new Date();
  }

  // 靜態工廠方法
  public static create(
    productId: ProductId,
    beforeQuantity: StockQuantity,
    afterQuantity: StockQuantity,
    operationType: InventoryOperationType,
    reason: OperationReason,
    operator: Operator
  ): InventoryLog {
    const logId = new InventoryLogId(Id.generate().value);
    return new InventoryLog(logId, productId, beforeQuantity, afterQuantity, operationType, reason, operator);
  }

  // Getters
  get productId(): ProductId {
    return this._productId;
  }

  get beforeQuantity(): StockQuantity {
    return this._beforeQuantity;
  }

  get afterQuantity(): StockQuantity {
    return this._afterQuantity;
  }

  get delta(): number {
    return this._delta;
  }

  get operationType(): InventoryOperationType {
    return this._operationType;
  }

  get reason(): OperationReason {
    return this._reason;
  }

  get operator(): Operator {
    return this._operator;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  public isIncrease(): boolean {
    return this._delta > 0;
  }

  public isDecrease(): boolean {
    return this._delta < 0;
  }
}

// 庫存聚合根
export class Inventory extends AggregateRoot<InventoryId> {
  private _productId: ProductId;
  private _quantity: StockQuantity;
  private _updatedAt: Date;

  constructor(
    id: InventoryId,
    productId: ProductId,
    quantity: StockQuantity,
    updatedAt?: Date
  ) {
    super(id);
    this._productId = productId;
    this._quantity = quantity;
    this._updatedAt = updatedAt || new Date();
  }

  // 靜態工廠方法：建立新庫存
  public static create(productId: ProductId, initialQuantity?: StockQuantity): Inventory {
    const inventoryId = new InventoryId(Id.generate().value);
    const quantity = initialQuantity || new StockQuantity(0);
    return new Inventory(inventoryId, productId, quantity);
  }

  // Getters
  get productId(): ProductId {
    return this._productId;
  }

  get quantity(): StockQuantity {
    return this._quantity;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // 業務方法：調整庫存
  public adjustStock(
    newQuantity: StockQuantity,
    operationType: InventoryOperationType,
    reason: OperationReason,
    operator: Operator
  ): InventoryLog {
    const previousQuantity = this._quantity;
    this._quantity = newQuantity;
    this._updatedAt = new Date();

    // 發布事件
    this.addDomainEvent(new StockAdjustedEvent(
      this._productId.value,
      previousQuantity.value,
      newQuantity.value,
      operationType.value
    ));

    // 建立日誌
    return InventoryLog.create(
      this._productId,
      previousQuantity,
      newQuantity,
      operationType,
      reason,
      operator
    );
  }

  // 業務方法：減少庫存（銷售）
  public reduceStock(
    quantity: StockQuantity,
    reason: OperationReason,
    operator: Operator
  ): InventoryLog {
    if (this._quantity.isLessThan(quantity)) {
      this.addDomainEvent(new StockInsufficientEvent(
        this._productId.value,
        quantity.value,
        this._quantity.value
      ));
      throw new BusinessRuleError(`庫存不足。可用: ${this._quantity.value}, 需要: ${quantity.value}`);
    }

    const newQuantity = this._quantity.subtract(quantity);
    return this.adjustStock(
      newQuantity,
      InventoryOperationType.SALE,
      reason,
      operator
    );
  }

  // 業務方法：增加庫存（補貨）
  public addStock(
    quantity: StockQuantity,
    reason: OperationReason,
    operator: Operator
  ): InventoryLog {
    const newQuantity = this._quantity.add(quantity);
    return this.adjustStock(
      newQuantity,
      InventoryOperationType.RESTOCK,
      reason,
      operator
    );
  }

  // 業務方法：檢查是否有足夠庫存
  public hasSufficientStock(requiredQuantity: StockQuantity): boolean {
    return this._quantity.isGreaterThan(requiredQuantity) || this._quantity.equals(requiredQuantity);
  }

  // 業務方法：檢查是否缺貨
  public isOutOfStock(): boolean {
    return this._quantity.isZero();
  }
}