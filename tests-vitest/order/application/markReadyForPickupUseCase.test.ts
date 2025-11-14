
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MarkReadyForPickupUseCase } from '@domains/order/application/use-cases/mark-ready-for-pickup/mark-ready-for-pickup.usecase';
import { StartPreparationUseCase } from '@domains/order/application/use-cases/start-preparation/start-preparation.usecase';
import { ConfirmOrderUseCase } from '@domains/order/application/use-cases/confirm-order/confirm-order.usecase';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { OrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';

describe('MarkReadyForPickupUseCase (integration)', () => {
  let orderRepository: OrderRepository;
  let eventPublisher: InMemoryDomainEventPublisher;
  let orderAppService: OrderAppService;
  let useCase: MarkReadyForPickupUseCase;
  let createOrderUseCase: CreateOrderUseCase;
  let createdOrderId: string;
  let startPreparationUseCase: StartPreparationUseCase;
  let confirmOrderUseCase: ConfirmOrderUseCase;

  beforeEach(async () => {
  orderRepository = new OrderRepository();
    eventPublisher = new InMemoryDomainEventPublisher();
    orderAppService = new OrderAppService(orderRepository, eventPublisher);
    useCase = new MarkReadyForPickupUseCase(orderAppService, eventPublisher);
    createOrderUseCase = new CreateOrderUseCase(orderAppService, eventPublisher);
    startPreparationUseCase = new StartPreparationUseCase(orderAppService, eventPublisher);
    confirmOrderUseCase = new ConfirmOrderUseCase(orderAppService, eventPublisher);
    // 建立一筆訂單供標記可取餐測試
    const result = await createOrderUseCase.execute({
      userId: 'user',
      description: 'markReadyForPickupUseCase.test.ts-建立可取餐測試訂單',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 1, price: 100 }
      ]
    });
    createdOrderId = result.orderId;
    // 狀態流轉：已點餐→已確認訂單→製作中
    await confirmOrderUseCase.execute(createdOrderId);
    await startPreparationUseCase.execute(createdOrderId);
  });


  it('應正確執行標記可取餐用例', async () => {
    // Act
  await useCase.execute(createdOrderId);
  // Assert
  const order = await orderRepository.findById(createdOrderId);
  expect(order?.status.value).toBe(4);
  });
});
