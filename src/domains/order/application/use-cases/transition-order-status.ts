import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { TransitionOrderStatusRequest, TransitionOrderStatusResponse } from '../dto/transition-order-status.dto';
import { OrderRepository } from '../../domain/repositories/order-repository';
import { OrderStatus } from '../../domain/value-objects/order-status';
import { OrderStateMachineService } from '../../domain/services/order-state-mechine-service';
import { DomainEventPublisher } from '../../../../shared/domain/events/domain-event';
import { NotFoundError, ValidationError } from '../../../../shared/application/exceptions';


/**
 * 用例：訂單狀態轉換
 * 負責驗證、執行狀態轉換、儲存、發佈事件
 */
export class TransitionOrderStatusUseCase implements UseCase<TransitionOrderStatusRequest, TransitionOrderStatusResponse> {
  /**
   * @param orderRepository 訂單倉儲
   * @param orderStateMachine 狀態機服務
   * @param eventPublisher 領域事件發佈器
   */
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderStateMachine: OrderStateMachineService,
    private readonly eventPublisher: DomainEventPublisher
  ) { }

  /**
   * 執行訂單狀態轉換
   * @param request 輸入請求 DTO
   * @returns 狀態轉換結果 DTO
   * @throws NotFoundError 找不到訂單
   * @throws ValidationError 驗證失敗
   */
  async execute(request: TransitionOrderStatusRequest): Promise<TransitionOrderStatusResponse> {
    // 驗證輸入
    this.validateRequest(request);

    // 取得訂單
    const order = await this.orderRepository.findById(request.orderId);
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
    await this.orderRepository.edit(order);

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

  /**
   * 驗證輸入參數
   * @param request 狀態轉換請求 DTO
   * @throws ValidationError 欄位缺漏或狀態值不合法
   */
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