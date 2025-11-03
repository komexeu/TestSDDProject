// OrderAppService 範例：DDD Application Layer 完整流程
// 1. 執行業務邏輯（如取消訂單）
// 2. 儲存聚合根到 DB
// 3. 發佈領域事件

import { PrismaOrderRepository } from '../../infrastructure/repositories/prisma-order-repository';

// 假設有一個 EventBus 介面

/**
 * EventBus 介面，負責發佈領域事件
 */
interface EventBus {
  /**
   * 發佈事件
   * @param event 任意事件物件
   */
  publish(event: any): Promise<void>;
}


/**
 * 訂單應用服務，協調聚合根與倉儲，執行業務邏輯
 */
export class OrderAppService {
  /**
   * @param orderRepository 訂單倉儲
   * @param eventBus 事件發佈器（目前僅用於型別說明）
   */
  constructor(
    private readonly orderRepository: PrismaOrderRepository,
    private readonly eventBus: EventBus
  ) {}

  // 取消訂單
  /**
   * 取消訂單
   * @param orderId 訂單ID
   * @param cancelledBy 取消者（user/counter）
   * @returns 聚合根 Order
   * @throws Error 找不到訂單
   */
  async cancelOrder(orderId: string, cancelledBy: 'user' | 'counter') {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.cancel(cancelledBy);
    await this.orderRepository.edit(order);
    return order;
  }

  // 確認訂單
  /**
   * 確認訂單
   * @param orderId 訂單ID
   * @returns 聚合根 Order
   * @throws Error 找不到訂單
   */
  async confirmOrder(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.setConfirm();
    await this.orderRepository.edit(order);
    return order;
  }

  // 開始製作
  /**
   * 開始製作
   * @param orderId 訂單ID
   * @returns 聚合根 Order
   * @throws Error 找不到訂單
   */
  async startPreparation(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.setStartPreparation();
    await this.orderRepository.edit(order);
    return order;
  }

  // 標記為可取餐
  /**
   * 標記為可取餐
   * @param orderId 訂單ID
   * @returns 聚合根 Order
   * @throws Error 找不到訂單
   */
  async markReadyForPickup(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.setMarkReadyForPickup();
    await this.orderRepository.edit(order);
    return order;
  }

  // 完成訂單
  /**
   * 完成訂單
   * @param orderId 訂單ID
   * @returns 聚合根 Order
   * @throws Error 找不到訂單
   */
  async completeOrder(orderId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.setComplete();
    await this.orderRepository.edit(order);
    return order;
  }

  // 標記失敗
  /**
   * 標記失敗
   * @param orderId 訂單ID
   * @param reason 失敗原因
   * @returns 聚合根 Order
   * @throws Error 找不到訂單
   */
  async failOrder(orderId: string, reason: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.setFail(reason);
    await this.orderRepository.edit(order);
    return order;
  }
}

// EventBus 實作範例（可用於測試或真實事件系統）

/**
 * 範例事件發佈器，可串接通知、log、外部 API 等
 */
export class SimpleEventBus implements EventBus {
  /**
   * 發佈事件
   * @param event 任意事件物件
   */
  async publish(event: any): Promise<void> {
    console.log('Event published:', event);
    // 可在這裡串接通知、log、外部 API 等
  }
}

// 使用範例
// const appService = new OrderAppService(new PrismaOrderRepository(), new SimpleEventBus());
// await appService.cancelOrder('order-id-123', 'user');
