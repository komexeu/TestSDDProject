import { OrderAppService } from '@/domains/order/application/service/order-app-service';
import { DomainEventPublisher } from '@/shared/domain/events/domain-event';

/**
 * 用例：標記訂單失敗
 * 執行訂單狀態轉換為「失敗」，儲存並發佈事件
 */
export class FailOrderUseCase {
  /**
   * @param orderAppService 應用服務，協調聚合根與倉儲
   * @param eventPublisher 領域事件發佈器
   */
  constructor(
    private readonly orderAppService: OrderAppService,
    private readonly eventPublisher: DomainEventPublisher
  ) {}

  /**
   * 執行標記失敗流程
   * @param orderId 訂單ID
   * @param reason 失敗原因
   */
  async execute(orderId: string, reason: string): Promise<void> {
    const order = await this.orderAppService.failOrder(orderId, reason);
    for (const event of order.getDomainEvents()) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();
  }
}
