
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfirmOrderUseCase } from '@domains/order/application/use-cases/confirm-order/confirm-order.usecase';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';

describe('ConfirmOrderUseCase (integration)', () => {
  let orderRepository: PrismaOrderRepository;
  let eventPublisher: InMemoryDomainEventPublisher;
  let orderAppService: OrderAppService;
  let useCase: ConfirmOrderUseCase;
  let createOrderUseCase: CreateOrderUseCase;
  let createdOrderId: string;

  beforeEach(async () => {
    orderRepository = new PrismaOrderRepository();
    eventPublisher = new InMemoryDomainEventPublisher();
    orderAppService = new OrderAppService(orderRepository, eventPublisher);
    useCase = new ConfirmOrderUseCase(orderAppService, eventPublisher);
    createOrderUseCase = new CreateOrderUseCase(orderAppService, eventPublisher);
    // 建立一筆訂單供確認測試
    const result = await createOrderUseCase.execute({
      userId: 'user',
      description: 'confirmOrderUseCase.test.ts-建立確認測試訂單',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 1, price: 100 }
      ]
    });
    createdOrderId = result.orderId;
  });


  it('應正確執行確認訂單用例', async () => {
    // Act
    await useCase.execute(createdOrderId);
    // Assert
    const order = await orderRepository.findById(createdOrderId);
  expect(order?.status.value).toBe('已確認訂單');
  });
});
