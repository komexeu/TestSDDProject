import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { DomainEventPublisher } from '@shared/domain/events/domain-event';
import { injectable, inject } from 'tsyringe';

/**
 * 用例：完成訂單
 * 執行訂單狀態轉換為「已完成」，儲存並發佈事件
 */
@injectable()
export class CompleteOrderUseCase {
  constructor(
    @inject('OrderAppService') private readonly orderAppService: OrderAppService,
    @inject('DomainEventPublisher') private readonly eventPublisher: DomainEventPublisher
  ) {}

  /**
   * 執行完成訂單流程
   * @param orderId 訂單ID
   */
  async execute(orderId: string): Promise<void> {
    const order = await this.orderAppService.completeOrder(orderId);
    for (const event of order.getDomainEvents()) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();
  }
}
