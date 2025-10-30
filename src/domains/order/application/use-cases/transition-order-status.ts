import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { TransitionOrderStatusRequest, TransitionOrderStatusResponse } from '../dto/order-dto';
import { OrderRepository } from '../../domain/repositories/order-repository';
import { OrderId } from '../../domain/entities/order';
import { OrderStatus } from '../../domain/value-objects/order-status';
import { OrderStateMachineService } from '../../domain/services/order-state-machine';
import { DomainEventPublisher } from '../../../../shared/domain/events/domain-event';
import { NotFoundError, ValidationError } from '../../../../shared/application/exceptions';

export class TransitionOrderStatusUseCase implements UseCase<TransitionOrderStatusRequest, TransitionOrderStatusResponse> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderStateMachine: OrderStateMachineService,
    private readonly eventPublisher: DomainEventPublisher
  ) {}

  async execute(request: TransitionOrderStatusRequest): Promise<TransitionOrderStatusResponse> {
    // 驗證輸入
    this.validateRequest(request);

    // 取得訂單
    const orderId = new OrderId(request.orderId);
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new NotFoundError('Order', request.orderId);
    }

    // 建立目標狀態
    const targetStatus = new OrderStatus(request.targetStatus);
    const previousStatus = order.status.value;

    // 驗證狀態轉換
    this.orderStateMachine.validateTransition(order, targetStatus);

    // 執行狀態轉換
    order.transitionTo(targetStatus);

    // 儲存訂單
    await this.orderRepository.save(order);

    // 發布領域事件
    const domainEvents = order.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();

    return {
      orderId: order.id.value,
      previousStatus,
      newStatus: order.status.value,
      updatedAt: order.updatedAt
    };
  }

  private validateRequest(request: TransitionOrderStatusRequest): void {
    if (!request.orderId || request.orderId.trim().length === 0) {
      throw new ValidationError('Order ID is required', 'orderId');
    }

    if (!request.targetStatus || request.targetStatus.trim().length === 0) {
      throw new ValidationError('Target status is required', 'targetStatus');
    }

    // 驗證狀態值是否有效
    const validStatuses = [
      '已點餐', '已確認訂單', '製作中', '可取餐', 
      '已取餐完成', '已取消', '製作失敗', '異常'
    ];
    
    if (!validStatuses.includes(request.targetStatus)) {
      throw new ValidationError(`Invalid status: ${request.targetStatus}`, 'targetStatus');
    }
  }
}