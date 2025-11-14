import { injectable, inject } from 'tsyringe';
// OrderAppService 範例：DDD Application Layer 完整流程
// 1. 執行業務邏輯（如取消訂單）
// 2. 儲存聚合根到 DB
// 3. 發佈領域事件


import { DomainEventPublisher } from '@shared/domain/events/domain-event';
import { Order, UserId } from '@domains/order/domain/entities/order';
import { OrderItem } from '@domains/order/domain/value-objects/order-item';
import { OrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';


/**
 * 訂單應用服務，協調聚合根與倉儲，執行業務邏輯
 */
@injectable()
export class OrderAppService {
  /**
   * 建立訂單
   * @param userId 用戶ID
   * @param items 訂單項目陣列
   * @returns 聚合根 Order
   */
  async createOrder(userId: string, items: { id: string; productId: string; name: string; quantity: number; price: number }[], description: string = '') {
    // 驗證 userId
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    // 驗證 items
    if (!items || items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    // 轉換 items 為 OrderItem 物件
    const orderItems: OrderItem[] = items.map(
      (item) => new OrderItem(item.id, item.productId, item.name, item.quantity, item.price)
    );
    // 建立 UserId 物件
    const userIdObj = new UserId(userId);
    // 建立 Order 聚合根
    const order = Order.create(userIdObj, orderItems, description);
    // 儲存到資料庫
    await this.orderRepository.create(order);
    return order;
  }
  /**
   * @param orderRepository 訂單倉儲
   * @param eventBus 事件發佈器（目前僅用於型別說明）
   */
  constructor(
    private readonly orderRepository: OrderRepository,
    @inject('DomainEventPublisher') private readonly eventPublisher: DomainEventPublisher
  ) { }

  /**
  * 直接更新訂單狀態（只改 status 欄位，無驗證、無事件）
  */
  async updateStatus(orderId: string, statusCode: number): Promise<void> {
    const { OrderStatus } = require('@domains/order/domain/value-objects/order-status');
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');
    order.transitionTo(new OrderStatus(statusCode));
    await this.orderRepository.edit(order);
  }

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


