import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { injectable, inject } from 'tsyringe';
import { DomainEventPublisher } from '@shared/domain/events/domain-event';

/**
 * 用例：標記可取餐
 * 執行訂單狀態轉換為「可取餐」，儲存並發佈事件
 */
@injectable()
export class MarkReadyForPickupUseCase {
  constructor(
    @inject('OrderAppService') private readonly orderAppService: OrderAppService,
    @inject('DomainEventPublisher') private readonly eventPublisher: DomainEventPublisher
  ) {}

  /**
   * 執行標記可取餐流程
   * @param orderId 訂單ID
   */
  async execute(orderId: string): Promise<void> {
    const order = await this.orderAppService.markReadyForPickup(orderId);
    for (const event of order.getDomainEvents()) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();
  }
}
