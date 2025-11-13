import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GetOrderDetailQueryHandler } from '@domains/order/application/queries/get-order-detail.query';
import { OrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';

// 整合測試：先建立訂單，再用 Query 查詢
describe('GetOrderDetailQueryHandler (integration with CreateOrderUseCase)', () => {
  const orderRepository = new OrderRepository();
  const eventPublisher = new InMemoryDomainEventPublisher();
  const appService = new OrderAppService(orderRepository, eventPublisher);
  const createOrderUseCase = new CreateOrderUseCase(appService, eventPublisher);
  const handler = new GetOrderDetailQueryHandler(orderRepository);
  let createdOrderId: string;

  beforeAll(async () => {
    const result = await createOrderUseCase.execute({
      userId: 'q-user-1',
      items: [
        { id: 'q-item-1', productId: '1', name: 'Query測試商品', quantity: 3, price: 80 }
      ],
      description: 'Query整合測試'
    });
    createdOrderId = result.orderId;
  });

  afterAll(async () => {
    // 若需要可在這裡清理資料，但目前以測試獨立性為主，不做刪除（後續可改用專屬測試 schema）
  });

  it('建立後的訂單應能被 Query 查得', async () => {
    const result = await handler.execute({ orderId: createdOrderId });
    expect(result).not.toBeNull();
    expect(result!.orderId).toBe(createdOrderId);
    expect(result!.items).toHaveLength(1);
    expect(result!.items[0].quantity).toBe(3);
    expect(result!.totalAmount).toBe(240); // 3 * 80
  });

  it('不存在的訂單應回傳 null', async () => {
    const result = await handler.execute({ orderId: 'no-such-order' });
    expect(result).toBeNull();
  });
});
