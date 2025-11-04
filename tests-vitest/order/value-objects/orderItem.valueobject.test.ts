import { describe, it, expect } from 'vitest';
import { OrderItem } from '../../../src/domains/order/domain/value-objects/order-item';

describe('OrderItem', () => {
  it('should create a valid OrderItem', () => {
    const item = new OrderItem('oi1', 'p1', '珍奶', 2, 50);
    expect(item.id).toBe('oi1');
    expect(item.productId).toBe('p1');
    expect(item.name).toBe('珍奶');
    expect(item.quantity).toBe(2);
    expect(item.price).toBe(50);
    expect(item.totalPrice).toBe(100);
  });

  it('should throw if name is not a string', () => {
    // @ts-expect-error 測試型別錯誤
    expect(() => new OrderItem('oi1', 'p1', 123, 1, 50)).toThrow();
    // @ts-expect-error 測試型別錯誤
    expect(() => new OrderItem('oi1', 'p1', undefined, 1, 50)).toThrow();
  });

  it('should throw if quantity <= 0', () => {
    expect(() => new OrderItem('oi1', 'p1', '珍奶', 0, 50)).toThrow();
  });

  it('should throw if price < 0', () => {
    expect(() => new OrderItem('oi1', 'p1', '珍奶', 1, -10)).toThrow();
  });

  it('should be equal if all values are the same', () => {
    const a = new OrderItem('oi1', 'p1', '珍奶', 1, 50);
    const b = new OrderItem('oi1', 'p1', '珍奶', 1, 50);
    expect(a.equals(b)).toBe(true);
  });

  it('withQuantity should return new OrderItem with updated quantity', () => {
    const item = new OrderItem('oi1', 'p1', '珍奶', 1, 50);
    const updated = item.withQuantity(3);
    expect(updated.quantity).toBe(3);
    expect(updated.id).toBe(item.id);
    expect(updated.name).toBe(item.name);
    expect(updated.price).toBe(item.price);
  });
});