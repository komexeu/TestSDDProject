import { Order as OrderDomain } from '../entities/order';
import { OrderItem } from '../value-objects/order-item';

// 訂單倉儲介面
export interface OrderRepository {
  findById(id: string): Promise<OrderDomain | null>;
  findByUserId(userId: string): Promise<OrderDomain[]>;
  create(order: OrderDomain): Promise<string>;
  edit(order: OrderDomain): Promise<void>;
  /**
   * 軟刪除訂單（將 isDelete 設為 true）
   */
  delete(id: string): Promise<void>;
}