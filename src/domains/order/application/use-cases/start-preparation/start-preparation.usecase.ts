import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { injectable, inject } from 'tsyringe';
import { DomainEventPublisher } from '@shared/domain/events/domain-event';

/**
 * 用例：開始製作
 * 執行訂單狀態轉換為「製作中」，儲存並發佈事件
 */
@injectable()
export class StartPreparationUseCase {
  constructor(
    @inject('OrderAppService') private readonly orderAppService: OrderAppService,
    @inject('DomainEventPublisher') private readonly eventPublisher: DomainEventPublisher
  ) {}

  /**
   * 執行開始製作流程
   * @param orderId 訂單ID
   */
  async execute(orderId: string): Promise<void> {
    const order = await this.orderAppService.startPreparation(orderId);
    for (const event of order.getDomainEvents()) {
      await this.eventPublisher.publish(event);
    }
    order.clearDomainEvents();
  }
}
