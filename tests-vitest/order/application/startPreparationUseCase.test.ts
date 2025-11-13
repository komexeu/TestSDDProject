
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StartPreparationUseCase } from '@domains/order/application/use-cases/start-preparation/start-preparation.usecase';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { OrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';
import { ConfirmOrderUseCase } from '@domains/order/application/use-cases/confirm-order/confirm-order.usecase';

describe('StartPreparationUseCase (integration)', () => {
  let orderRepository: OrderRepository;
  let eventPublisher: InMemoryDomainEventPublisher;
  let orderAppService: OrderAppService;
  let useCase: StartPreparationUseCase;
  let createOrderUseCase: CreateOrderUseCase;
  let createdOrderId: string;
  let confirmOrderUseCase: ConfirmOrderUseCase;

  beforeEach(async () => {
  orderRepository = new OrderRepository();
    eventPublisher = new InMemoryDomainEventPublisher();
    orderAppService = new OrderAppService(orderRepository, eventPublisher);
    useCase = new StartPreparationUseCase(orderAppService, eventPublisher);
    createOrderUseCase = new CreateOrderUseCase(orderAppService, eventPublisher);
    confirmOrderUseCase = new ConfirmOrderUseCase(orderAppService, eventPublisher);
    // 建立一筆訂單供開始製作測試
    const result = await createOrderUseCase.execute({
      userId: 'user',
      description: 'startPreparationUseCase.test.ts-建立開始製作測試訂單',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 1, price: 100 }
      ]
    });
    createdOrderId = result.orderId;
    // 狀態流轉：已點餐→已確認訂單
    await confirmOrderUseCase.execute(createdOrderId);
  });


  it('應正確執行開始製作用例', async () => {
    // Act
    await useCase.execute(createdOrderId);
    // Assert
    const order = await orderRepository.findById(createdOrderId);
  expect(order?.status.value).toBe('製作中');
  });
});
