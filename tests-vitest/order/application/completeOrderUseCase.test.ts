
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CompleteOrderUseCase } from '@domains/order/application/use-cases/complete-order/complete-order.usecase';
import { MarkReadyForPickupUseCase } from '@domains/order/application/use-cases/mark-ready-for-pickup/mark-ready-for-pickup.usecase';
import { ConfirmOrderUseCase } from '@domains/order/application/use-cases/confirm-order/confirm-order.usecase';
import { StartPreparationUseCase } from '@domains/order/application/use-cases/start-preparation/start-preparation.usecase';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { OrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';

describe('CompleteOrderUseCase (integration)', () => {
  let orderRepository: OrderRepository;
  let eventPublisher: InMemoryDomainEventPublisher;
  let orderAppService: OrderAppService;
  let useCase: CompleteOrderUseCase;
  let createOrderUseCase: CreateOrderUseCase;
  let createdOrderId: string;
  let markReadyForPickupUseCase: MarkReadyForPickupUseCase;
  let confirmOrderUseCase: ConfirmOrderUseCase;
  let startPreparationUseCase: StartPreparationUseCase;

  beforeEach(async () => {
  orderRepository = new OrderRepository();
    eventPublisher = new InMemoryDomainEventPublisher();
    orderAppService = new OrderAppService(orderRepository, eventPublisher);
    useCase = new CompleteOrderUseCase(orderAppService, eventPublisher);
    createOrderUseCase = new CreateOrderUseCase(orderAppService, eventPublisher);
    markReadyForPickupUseCase = new MarkReadyForPickupUseCase(orderAppService, eventPublisher);
    confirmOrderUseCase = new ConfirmOrderUseCase(orderAppService, eventPublisher);
    startPreparationUseCase = new StartPreparationUseCase(orderAppService, eventPublisher);
    // 建立一筆訂單供完成測試
    const result = await createOrderUseCase.execute({
      userId: 'user',
      description: 'completeOrderUseCase.test.ts-應正確執行完成訂單用例',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 1, price: 100 }
      ]
    });
    createdOrderId = result.orderId;
    // 狀態流轉：已點餐→已確認訂單→製作中→可取餐
    await confirmOrderUseCase.execute(createdOrderId);
    let order = await orderRepository.findById(createdOrderId);
    expect(order?.status.value).toBe('已確認訂單');
    await startPreparationUseCase.execute(createdOrderId);
    order = await orderRepository.findById(createdOrderId);
    expect(order?.status.value).toBe('製作中');
    await markReadyForPickupUseCase.execute(createdOrderId);
    order = await orderRepository.findById(createdOrderId);
    expect(order?.status.value).toBe('可取餐');
  });


  it('應正確執行完成訂單用例', async () => {
    // Act
    await useCase.execute(createdOrderId);
    // Assert
    const order = await orderRepository.findById(createdOrderId);
    expect(order?.status.value).toBe('已取餐完成');
  });
});
