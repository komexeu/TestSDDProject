import { Order, OrderId } from '../entities/order';

// 訂單倉儲介面
export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
  delete(id: OrderId): Promise<void>;
}