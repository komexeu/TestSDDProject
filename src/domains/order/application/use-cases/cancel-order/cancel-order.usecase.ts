import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { DomainEventPublisher } from '@shared/domain/events/domain-event';
import { injectable, inject } from 'tsyringe';

/**
 * 用例：取消訂單
 * 執行訂單狀態轉換為「已取消」，儲存並發佈事件
 */
@injectable()
export class CancelOrderUseCase {
  constructor(
    @inject('OrderAppService') private readonly orderAppService: OrderAppService,
    @inject('DomainEventPublisher') private readonly eventPublisher: DomainEventPublisher
  ) {}

  /**
   * 執行取消訂單流程
   * @param orderId 訂單ID
   * @param cancelledBy 取消者（user/counter）
   */
  async execute(orderId: string, cancelledBy: 'user' | 'counter'): Promise<void> {
    const order = await this.orderAppService.cancelOrder(orderId, cancelledBy);
    for (const event of order.getDomainEvents()) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();
  }
}
