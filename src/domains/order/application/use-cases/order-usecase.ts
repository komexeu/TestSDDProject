// OrderUseCase：用例層，負責調用 service，並統一發佈事件
import { OrderAppService } from '../service/order-app-service-example';

interface EventBus {
  publish(event: any): Promise<void>;
}

export class OrderUseCase {
  constructor(
    private readonly orderAppService: OrderAppService,
    private readonly eventBus: EventBus
  ) {}

  /**
   * 用例：取消訂單
   */
  async cancelOrder(orderId: string, cancelledBy: 'user' | 'counter'): Promise<void> {
    const order = await this.orderAppService.cancelOrder(orderId, cancelledBy);
    for (const event of order.getDomainEvents()) {
      await this.eventBus.publish(event);
    }
    order.clearDomainEvents();
  }

  /**
   * 用例：確認訂單
   */
  async confirmOrder(orderId: string): Promise<void> {
    const order = await this.orderAppService.confirmOrder(orderId);
    for (const event of order.getDomainEvents()) {
      await this.eventBus.publish(event);
    }
    order.clearDomainEvents();
  }

  /**
   * 用例：開始製作
   */
  async startPreparation(orderId: string): Promise<void> {
    const order = await this.orderAppService.startPreparation(orderId);
    for (const event of order.getDomainEvents()) {
      await this.eventBus.publish(event);
    }
    order.clearDomainEvents();
  }

  /**
   * 用例：標記為可取餐
   */
  async markReadyForPickup(orderId: string): Promise<void> {
    const order = await this.orderAppService.markReadyForPickup(orderId);
    for (const event of order.getDomainEvents()) {
      await this.eventBus.publish(event);
    }
    order.clearDomainEvents();
  }

  /**
   * 用例：完成訂單
   */
  async completeOrder(orderId: string): Promise<void> {
    const order = await this.orderAppService.completeOrder(orderId);
    for (const event of order.getDomainEvents()) {
      await this.eventBus.publish(event);
    }
    order.clearDomainEvents();
  }

  /**
   * 用例：標記失敗
   */
  async failOrder(orderId: string, reason: string): Promise<void> {
    const order = await this.orderAppService.failOrder(orderId, reason);
    for (const event of order.getDomainEvents()) {
      await this.eventBus.publish(event);
    }
    order.clearDomainEvents();
  }
}

// 使用範例：
// const usecase = new OrderUseCase(new OrderAppService(...), new SimpleEventBus());
// await usecase.cancelOrder('order-id', 'user');
