
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CancelOrderUseCase } from '@domains/order/application/use-cases/cancel-order/cancel-order.usecase';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';

describe('CancelOrderUseCase (integration)', () => {
  let orderRepository: PrismaOrderRepository;
  let eventPublisher: InMemoryDomainEventPublisher;
  let orderAppService: OrderAppService;
  let useCase: CancelOrderUseCase;
  let createOrderUseCase: CreateOrderUseCase;
  let createdOrderId: string;

  beforeEach(async () => {
    orderRepository = new PrismaOrderRepository();
    eventPublisher = new InMemoryDomainEventPublisher();
    orderAppService = new OrderAppService(orderRepository, eventPublisher);
    useCase = new CancelOrderUseCase(orderAppService, eventPublisher);
    createOrderUseCase = new CreateOrderUseCase(orderAppService, eventPublisher);
    // 建立一筆訂單供取消測試
    const result = await createOrderUseCase.execute({
      userId: 'user-1',
      description: 'cancelOrderUseCase.test.ts-建立取消測試訂單',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 1, price: 100 }
      ]
    });
    createdOrderId = result.orderId;
  });


  it('應正確執行取消訂單用例', async () => {
    // Act
    await useCase.execute(createdOrderId, 'user');
    // Assert
    const order = await orderRepository.findById(createdOrderId);
    expect(order?.status.value).toBe('已取消');
  });
});
