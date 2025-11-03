import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { OrderService } from '../../src/domains/order/application/OrderService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const service = new OrderService();

const testUserId = 'test-user-1';
const testProductId = 'test-product-1';

beforeAll(async () => {
  // 建立測試商品
  await prisma.product.create({
    data: {
      id: testProductId,
      name: '測試商品',
      description: '單元測試用',
      price: 100,
      stock: 10,
    },
  });
});

afterAll(async () => {
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.$disconnect();
});

describe('OrderService', () => {
  it('createOrder & getOrder', async () => {
    const order = await service.createOrder({
      userId: testUserId,
      status: '已點餐',
      totalAmount: 200,
      items: [
        {
          productId: testProductId,
          name: '測試商品',
          quantity: 2,
          price: 100,
          totalPrice: 200,
        },
      ],
    });
    expect(order).toBeDefined();
    expect(order.items.length).toBe(1);
    const found = await service.getOrder(order.id);
    expect(found).not.toBeNull();
    expect(found?.items[0].productId).toBe(testProductId);
  });

  it('updateOrder', async () => {
    const order = await service.createOrder({
      userId: testUserId,
      status: '已點餐',
      totalAmount: 100,
      items: [
        {
          productId: testProductId,
          name: '測試商品',
          quantity: 1,
          price: 100,
          totalPrice: 100,
        },
      ],
    });
    const updated = await service.updateOrder(order.id, { status: '已取餐完成' });
    expect(updated?.status).toBe('已取餐完成');
  });

  it('deleteOrder', async () => {
    const order = await service.createOrder({
      userId: testUserId,
      status: '已點餐',
      totalAmount: 100,
      items: [
        {
          productId: testProductId,
          name: '測試商品',
          quantity: 1,
          price: 100,
          totalPrice: 100,
        },
      ],
    });
    const deleted = await service.deleteOrder(order.id);
    expect(deleted?.isDelete).toBe(true);
  });
});
