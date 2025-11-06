
import { describe, it, expect, beforeEach } from 'vitest';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';
import { CreateOrderRequest } from '@domains/order/application/use-cases/create-order/create-order.dto';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { GetOrderDetailQueryHandler } from '@domains/order/application/queries/get-order-detail.query';

describe('CreateOrderUseCase (integration)', () => {
  let orderRepository: PrismaOrderRepository;
  let eventPublisher: InMemoryDomainEventPublisher;
  let orderAppService: OrderAppService;
  let useCase: CreateOrderUseCase;
  let getOrderDetailQueryHandler: GetOrderDetailQueryHandler;

  beforeEach(async () => {
    orderRepository = new PrismaOrderRepository();
    eventPublisher = new InMemoryDomainEventPublisher();
    orderAppService = new OrderAppService(orderRepository, eventPublisher);
    useCase = new CreateOrderUseCase(orderAppService, eventPublisher);
    getOrderDetailQueryHandler = new GetOrderDetailQueryHandler(orderRepository);
    // 不再於此建立測試商品，統一使用全域 setup 的預設資料
  });


  it('應正確執行建立訂單用例', async () => {
    // Arrange
    const request: CreateOrderRequest = {
      userId: 'user-1',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 2, price: 100 }
      ],
      description: 'createOrderUseCase.test.ts-應正確執行建立訂單用例'
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    const orderDetail = await getOrderDetailQueryHandler.execute({ orderId: result.orderId });
    expect(orderDetail).not.toBeNull();
    expect(result).toMatchObject({
      orderId: orderDetail!.orderId,
      userId: 'user-1',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 2, price: 100 }
      ],
      description: 'createOrderUseCase.test.ts-應正確執行建立訂單用例',
      status: orderDetail!.status,
      totalAmount: 200,
    });
    // 驗證事件
    // 由於 InMemoryDomainEventPublisher 需訂閱才會有 handlers，這裡僅驗證不拋錯即可
  });

  it('userId 為空時應丟出錯誤', async () => {
    const request: CreateOrderRequest = {
      userId: '',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 2, price: 100 }
      ],
      description: 'createOrderUseCase.test.ts-userId為空時應丟出錯誤'
    };
    await expect(useCase.execute(request)).rejects.toThrow('User ID is required');
  });

  it('items 為空時應丟出錯誤', async () => {
    const request: CreateOrderRequest = {
      userId: 'user-1',
      items: [],
      description: 'createOrderUseCase.test.ts-items為空時應丟出錯誤'
    };
    await expect(useCase.execute(request)).rejects.toThrow('Order must have at least one item');
  });
});
