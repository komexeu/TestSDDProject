
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FailOrderUseCase } from '@domains/order/application/use-cases/fail-order/fail-order.usecase';
import { StartPreparationUseCase } from '@domains/order/application/use-cases/start-preparation/start-preparation.usecase';
import { ConfirmOrderUseCase } from '@domains/order/application/use-cases/confirm-order/confirm-order.usecase';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { OrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';

describe('FailOrderUseCase (integration)', () => {
  let orderRepository: OrderRepository;
  let eventPublisher: InMemoryDomainEventPublisher;
  let orderAppService: OrderAppService;
  let failUseCase: FailOrderUseCase;
  let createOrderUseCase: CreateOrderUseCase;
  let createdOrderId: string;
  let startPreparationUseCase: StartPreparationUseCase;
  let confirmOrderUseCase: ConfirmOrderUseCase;

  beforeEach(async () => {
  orderRepository = new OrderRepository();
    eventPublisher = new InMemoryDomainEventPublisher();
    orderAppService = new OrderAppService(orderRepository, eventPublisher);
    failUseCase = new FailOrderUseCase(orderAppService, eventPublisher);
    createOrderUseCase = new CreateOrderUseCase(orderAppService, eventPublisher);
    startPreparationUseCase = new StartPreparationUseCase(orderAppService, eventPublisher);
    confirmOrderUseCase = new ConfirmOrderUseCase(orderAppService, eventPublisher);
    // 建立一筆訂單供失敗測試
    const result = await createOrderUseCase.execute({
      userId: 'user',
      description: 'failOrderUseCase.test.ts-建立失敗測試訂單',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 1, price: 100 }
      ]
    });
    createdOrderId = result.orderId;
    // 狀態流轉：已點餐→已確認訂單→製作中
    await confirmOrderUseCase.execute(createdOrderId);
    let order = await orderRepository.findById(createdOrderId);
    expect(order?.status.value).toBe('已確認訂單');
    await startPreparationUseCase.execute(createdOrderId);
    order = await orderRepository.findById(createdOrderId);
    expect(order?.status.value).toBe('製作中');
  });


  it('應正確執行標記失敗用例', async () => {
    // Act
    let order = await orderRepository.findById(createdOrderId);
    await failUseCase.execute(createdOrderId, '測試失敗');
    // Assert
    order = await orderRepository.findById(createdOrderId);
    expect(order?.status.value).toBe('製作失敗');
  });
});
