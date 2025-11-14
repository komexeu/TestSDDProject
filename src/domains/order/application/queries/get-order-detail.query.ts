/**
 * 查詢訂單明細 Query
 * Application Query 層，僅查詢，不發佈事件
 */
import { OrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { getOrderStatusName } from '@domains/order/domain/value-objects/order-status';
import { injectable } from 'tsyringe';

export interface GetOrderDetailQuery {
  orderId: string;
}

export interface GetOrderDetailResult {
  orderId: string;
  userId: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  status: string;
  totalAmount: number;
  createdAt: Date;
}

@injectable()
export class GetOrderDetailQueryHandler {
  constructor(private readonly orderRepository: OrderRepository) { }

  /**
   * 查詢訂單明細
   * @param query 查詢參數
   * @returns 訂單明細結果
   */
  async execute(query: GetOrderDetailQuery): Promise<GetOrderDetailResult | null> {
    const order = await this.orderRepository.findById(query.orderId);
    if (!order) return null;
    // 使用共用方法取得狀態名稱
    return {
      orderId: order.id.value,
      userId: order.userId.value,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      status: getOrderStatusName(order.status.value),
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    };
  }
}
