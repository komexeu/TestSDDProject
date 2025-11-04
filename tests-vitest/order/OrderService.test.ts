import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { OrderAppService } from '../../src/domains/order/application/service/order-app-service';
import { PrismaOrderRepository } from '../../src/domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '../../src/shared/domain/events/domain-event';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
const orderRepository = new PrismaOrderRepository();
const eventPublisher = new InMemoryDomainEventPublisher();
const service = new OrderAppService(orderRepository, eventPublisher);

const testUserId = 'test-user-1';
const testProductId = 'test-product-1';


beforeAll(async () => {
  // 先刪除 InventoryLog、OrderItem、Order、Product，避免唯一鍵衝突與外鍵問題
  await prisma.inventoryLog?.deleteMany?.({ where: { productId: testProductId } }).catch(() => {});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({ where: { id: testProductId } });
  // upsert 測試商品，避免外鍵錯誤
  await prisma.product.upsert({
    where: { id: testProductId },
    update: {},
    create: {
      id: testProductId,
      name: '測試商品',
      description: '單元測試用',
      price: 100,
      stock: 10,
    },
  });
});


afterAll(async () => {
  await prisma.inventoryLog?.deleteMany?.({ where: { productId: testProductId } }).catch(() => {});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({ where: { id: testProductId } });
  await prisma.$disconnect();
});

describe('OrderService', () => {
  it('createOrder & getOrder', async () => {
    const items = [
      { id: 'oi1', productId: testProductId, name: '測試商品', quantity: 2, price: 100 }
    ];
    const order = await service.createOrder(testUserId, items);
    expect(order).toBeDefined();
    expect(order.items.length).toBe(1);
    const found = await orderRepository.findById(order.id.value);
    expect(found).not.toBeNull();
    expect(found?.items[0].productId).toBe(testProductId);
  });

  it('updateOrder', async () => {
    const items = [
      { id: 'oi2', productId: testProductId, name: '測試商品', quantity: 1, price: 100 }
    ];
    const order = await service.createOrder(testUserId, items);
    // 假設有 confirmOrder 方法
    const updated = await service.confirmOrder(order.id.value);
  expect(updated.status.value).toBe('已確認訂單');
  });

  it('deleteOrder', async () => {
    const items = [
      { id: 'oi3', productId: testProductId, name: '測試商品', quantity: 1, price: 100 }
    ];
    const order = await service.createOrder(testUserId, items);
    await orderRepository.delete(order.id.value);
    const deleted = await orderRepository.findById(order.id.value);
  expect(deleted?.isDelete).toBe(true);
  });
});
