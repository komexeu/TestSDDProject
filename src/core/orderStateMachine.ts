// 訂單狀態流轉邏輯
import { OrderStatus } from '../models/types';

export const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  '已點餐': ['已確認訂單', '已取消'],
  '已確認訂單': ['製作中', '已取消'],
  '製作中': ['可取餐', '製作失敗'],
  '可取餐': ['已取餐完成'],
  '已取餐完成': [],
  '已取消': [],
  '製作失敗': [],
  '異常': [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}
