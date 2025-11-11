
import { describe, it, expect } from 'vitest';
import { GetOrderListQueryHandler } from '../../../src/domains/order/application/queries/get-order-list.query';
import { PrismaOrderRepository } from '../../../src/domains/order/infrastructure/repositories/prisma-order-repository';

describe('GetOrderListQueryHandler (integration, real repository)', () => {
  it('應該能查到訂單且每筆訂單 items 欄位正確 (直接 new repository)', async () => {
    const repo = new PrismaOrderRepository();
    const handler = new GetOrderListQueryHandler(repo);
    const result = await handler.execute({});
    expect(result.orders.length).toBeGreaterThan(0);
    for (const order of result.orders) {
      expect(order.items).toBeDefined();
      expect(Array.isArray(order.items)).toBe(true);
      expect(order.items.length).toBeGreaterThan(0);
      for (const item of order.items) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('productId');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('price');
        expect(typeof item.id).toBe('string');
        expect(typeof item.productId).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(typeof item.quantity).toBe('number');
        expect(typeof item.price).toBe('number');
      }
    }
  });
});
