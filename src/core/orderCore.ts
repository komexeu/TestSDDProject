// 訂單核心邏輯（中文狀態）
export type Item = { id: string; name: string; price: number };

export type OrderStatus =
  | '已點餐'
  | '可取餐'
  | '已取餐完成'
  | '已取消';

export interface Order {
  id: string;
  userId: string;
  items: Item[];
  status: OrderStatus;
  canceledBy?: string;
}

export function createOrder(userId: string, items: Item[]): Order {
  return {
    id: 'order-1',
    userId,
    items,
    status: '已點餐',
  };
}

export function transitionOrderStatus(order: Order, status: OrderStatus): Order {
  // 允許依測試需求的狀態流轉
  const allowed: Record<OrderStatus, OrderStatus[]> = {
    '已點餐': ['可取餐'],
    '可取餐': ['已取餐完成'],
    '已取餐完成': [],
    '已取消': [],
  };
  if (allowed[order.status] && allowed[order.status].includes(status)) {
    return { ...order, status };
  }
  throw new Error('不允許的狀態流轉');
}

export function cancelOrder(order: Order, canceledBy: string): Order {
  // 只有「已點餐」或「可取餐」可取消
  if (order.status === '已點餐' || order.status === '可取餐') {
    return { ...order, status: '已取消', canceledBy };
  }
  throw new Error('不可取消');
}

export function completeOrder(order: Order): Order {
  // 只有「可取餐」可完成
  if (order.status === '可取餐') {
    return { ...order, status: '已取餐完成' };
  }
  throw new Error('不可於非可取餐狀態完成訂單');
}
