import { Order as OrderDomain } from '@domains/order/domain/entities/order';
import { OrderItem } from '../value-objects/order-item';

export interface FindAllOptions {
  limit: number;
  offset: number;
  userId?: string;
  status?: string;
}

export interface FindAllResult {
  orders: OrderDomain[];
  total: number;
}

// 訂單倉儲介面
export interface OrderRepository {
  findById(id: string): Promise<OrderDomain | null>;
  findByUserId(userId: string): Promise<OrderDomain[]>;
  findAll(options: FindAllOptions): Promise<FindAllResult>;
  create(order: OrderDomain): Promise<string>;
  edit(order: OrderDomain): Promise<void>;
  /**
   * 軟刪除訂單（將 isDelete 設為 true）
   */
  delete(id: string): Promise<void>;
}