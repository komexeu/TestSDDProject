import { describe, it, expect } from 'vitest';
import { Order } from '@domains/order/domain/entities/order';
import { OrderStatus } from '@domains/order/domain/value-objects/order-status';
import { sendOrderNotification } from '@domains/order/domain/services/order-notification-service';

function createOrder() {
  return new Order(
    { value: 'o-2' } as any,
    { value: 'u-2' } as any,
    [
      { id: 'i-1', productId: 'p-1', name: '商品A', quantity: 1, price: 50, totalPrice: 50 },
      { id: 'i-2', productId: 'p-2', name: '商品B', quantity: 2, price: 30, totalPrice: 60 }
    ] as any,
    '通知測試',
    OrderStatus.已點餐,
    new Date(),
    new Date()
  );
}

describe('sendOrderNotification', () => {
  it('應正確呼叫 notify 並帶入訂單資訊', () => {
    const order = createOrder();
    let called = false;
    let payload: any = null;
    sendOrderNotification(order, (p) => {
      called = true;
      payload = p;
    });
    expect(called).toBe(true);
    expect(payload).toMatchObject({
      id: 'o-2',
      userId: 'u-2',
      status: OrderStatus.已點餐.value,
      items: [
        { id: 'i-1', name: '商品A', quantity: 1, price: 50, totalPrice: 50 },
        { id: 'i-2', name: '商品B', quantity: 2, price: 30, totalPrice: 60 }
      ]
    });
  });
});
