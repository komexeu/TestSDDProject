/**
 * 查詢訂單列表 Query
 * Application Query 層，僅查詢，不發佈事件
 */
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { Order as OrderDomain } from '@domains/order/domain/entities/order';

export interface GetOrderListQuery {
  /** 限制返回筆數，預設為 10 */
  limit?: number;
  /** 跳過筆數，用於分頁，預設為 0 */
  offset?: number;
  /** 按使用者 ID 篩選 */
  userId?: string;
  /** 按狀態篩選 */
  status?: string;
}

export interface GetOrderListResult {
  orders: Array<{
    orderId: string;
    userId: string;
    description: string;
    status: string;
    totalAmount: number;
    itemCount: number;
    createdAt: Date;
  }>;
  total: number;
  hasMore: boolean;
}

export class GetOrderListQueryHandler {
  constructor(private readonly orderRepository: PrismaOrderRepository) {}

  /**
   * 查詢訂單列表
   * @param query 查詢參數
   * @returns 訂單列表結果
   */
  async execute(query: GetOrderListQuery): Promise<GetOrderListResult> {
    const limit = query.limit || 10;
    const offset = query.offset || 0;
    
    const { orders, total } = await this.orderRepository.findAll({
      limit,
      offset,
      userId: query.userId,
      status: query.status,
    });

    return {
      orders: orders.map((order: OrderDomain) => ({
        orderId: order.id.value,
        userId: order.userId.value,
        description: order.description,
        status: order.status.value,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        createdAt: order.createdAt,
      })),
      total,
      hasMore: offset + limit < total,
    };
  }
}