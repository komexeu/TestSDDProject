import { Order } from '@domains/order/domain/entities/order';

// 簡易通知服務，實際可整合 email/push/queue
export function sendOrderNotification(order: Order, notify: (payload: any) => void) {
  notify({
    id: order.id.value,
    userId: order.userId.value,
    status: order.status.value,
    items: order.items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
    })),
  });
}
