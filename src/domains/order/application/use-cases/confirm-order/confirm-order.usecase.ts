import { OrderAppService } from '@/domains/order/application/service/order-app-service';
import { DomainEventPublisher } from '@/shared/domain/events/domain-event';

/**
 * 用例：確認訂單
 * 執行訂單狀態轉換為「已確認」，儲存並發佈事件
 */
export class ConfirmOrderUseCase {
  /**
   * @param orderAppService 應用服務，協調聚合根與倉儲
   * @param eventPublisher 領域事件發佈器
   */
  constructor(
    private readonly orderAppService: OrderAppService,
    private readonly eventPublisher: DomainEventPublisher
  ) {}

  /**
   * 執行確認訂單流程
   * @param orderId 訂單ID
   */
  async execute(orderId: string): Promise<void> {
    const order = await this.orderAppService.confirmOrder(orderId);
    for (const event of order.getDomainEvents()) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();
  }
}
