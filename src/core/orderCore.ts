// 訂單操作核心函式（純 TypeScript，僅操作 in-memory 結構）
// 提供訂單建立、狀態流轉、取消、完成等核心邏輯，型別安全、錯誤明確
import { Order, Item, OrderStatus } from '../models/types';
import { canTransition } from './orderStateMachine';

export function createOrder(userId: string, items: Item[]): Order {
  const now = new Date();
  // 驗證 items
  if (!items || items.length === 0) throw new Error('訂單必須包含至少一項餐點');
  for (const item of items) {
    if (item.quantity <= 0) throw new Error('餐點數量必須大於 0');
    if (!item.name) throw new Error('餐點名稱不可為空');
  }
  return {
    id: crypto.randomUUID(),
    userId,
    status: '已點餐',
    items,
    createdAt: now,
    updatedAt: now,
    canceledBy: null,
    errorMsg: null,
  };
}

export function transitionOrderStatus(order: Order, to: OrderStatus): Order {
  if (!canTransition(order.status, to)) {
    throw new Error(`無法從 ${order.status} 轉換到 ${to}`);
  }
  // 狀態流轉時，清除 errorMsg
  return {
    ...order,
    status: to,
    updatedAt: new Date(),
    errorMsg: null,
  };
}

export function cancelOrder(order: Order, by: 'user' | 'counter'): Order {
  if (!['已點餐', '已確認訂單'].includes(order.status)) {
    throw new Error('僅能於「已點餐」或「已確認訂單」狀態取消訂單');
  }
  return {
    ...order,
    status: '已取消',
    canceledBy: by,
    updatedAt: new Date(),
    errorMsg: null,
  };
}

export function completeOrder(order: Order): Order {
  if (order.status !== '可取餐') {
    throw new Error('僅能於「可取餐」狀態完成訂單');
  }
  return {
    ...order,
    status: '已取餐完成',
    updatedAt: new Date(),
    errorMsg: null,
  };
}

// 補充：廚房拒單/失敗
export function failOrder(order: Order, reason: string): Order {
  if (order.status !== '製作中') {
    throw new Error('僅能於「製作中」狀態標記失敗');
  }
  return {
    ...order,
    status: '製作失敗',
    updatedAt: new Date(),
    errorMsg: reason,
  };
}
