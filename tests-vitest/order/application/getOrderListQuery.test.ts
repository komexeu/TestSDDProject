import { describe, it, expect, vi } from 'vitest';
import { GetOrderListQueryHandler } from '../../../src/domains/order/application/queries/get-order-list.query';
import { OrderRepository } from '../../../src/domains/order/infrastructure/repositories/prisma-order-repository';
import { Order } from '../../../src/domains/order/domain/entities/order';
import { OrderItem } from '../../../src/domains/order/domain/value-objects/order-item';
import { OrderStatus } from '../../../src/domains/order/domain/value-objects/order-status';

// Mock repository
const mockFindAll = vi.fn();
const mockRepo = { findAll: mockFindAll } as unknown as OrderRepository;

describe('GetOrderListQueryHandler', () => {
  it('should return orders with items array', async () => {
    const order = new Order(
      { value: 'order1' },
      { value: 'user1' },
      [new OrderItem('item1', 'p1', '可樂', 2, 30), new OrderItem('item2', 'p2', '薯條', 1, 50)],
      '測試訂單',
      OrderStatus.已點餐,
      new Date('2025-11-11T10:00:00Z')
    );
    mockFindAll.mockResolvedValue({ orders: [order], total: 1 });

    const handler = new GetOrderListQueryHandler(mockRepo);
    const result = await handler.execute({});
    expect(result.orders).toHaveLength(1);
    const o = result.orders[0];
    expect(o.orderId).toBe('order1');
    expect(o.items).toEqual([
      { id: 'item1', productId: 'p1', name: '可樂', quantity: 2, price: 30 },
      { id: 'item2', productId: 'p2', name: '薯條', quantity: 1, price: 50 }
    ]);
    expect(o.items[0].quantity).toBe(2);
    expect(o.items[1].price).toBe(50);
  });
});
