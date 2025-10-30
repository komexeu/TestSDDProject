import { describe, it, expect } from 'vitest';
import { createOrder, transitionOrderStatus, cancelOrder, completeOrder, Item, OrderStatus } from '../src/core/orderCore';

describe('訂單核心邏輯', () => {
  const userId = 'U123';
  const items: Item[] = [
    { id: 'I1', name: '咖啡', price: 50 },
  ];

  it('建立訂單預設狀態為已點餐', () => {
    const order = createOrder(userId, items);
    expect(order.status).toBe('已點餐');
    expect(order.items.length).toBe(1);
  });

  it('訂單狀態可正確流轉', () => {
    let order = createOrder(userId, items);
    order = transitionOrderStatus(order, '可取餐');
    expect(order.status).toBe('可取餐');
    order = completeOrder(order);
    expect(order.status).toBe('已取餐完成');
  });

  it('訂單僅能於特定狀態取消', () => {
    let order = createOrder(userId, items);
    order = cancelOrder(order, 'user');
    expect(order.status).toBe('已取消');
    expect(order.canceledBy).toBe('user');
  });

  it('不可於非可取餐狀態完成訂單', () => {
    let order = createOrder(userId, items);
    expect(() => completeOrder(order)).toThrow();
  });
});
