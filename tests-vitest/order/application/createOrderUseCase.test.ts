
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';
import { CreateOrderRequest } from '@domains/order/application/use-cases/create-order/create-order.dto';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { ProductRepository } from '@domains/product/infrastructure/repositories/product-repository.prisma';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { GetOrderDetailQueryHandler } from '@domains/order/application/queries/get-order-detail.query';
import { Product, ProductId } from '@domains/product/domain/entities/product';
import { ProductName, ProductDescription, ProductPrice, ProductCode } from '@domains/product/domain/value-objects/product-properties';

describe('CreateOrderUseCase (integration)', () => {
  let orderRepository: PrismaOrderRepository;
  let productRepository: ProductRepository;
  let eventPublisher: InMemoryDomainEventPublisher;
  let orderAppService: OrderAppService;
  let useCase: CreateOrderUseCase;
  let getOrderDetailQueryHandler: GetOrderDetailQueryHandler;

  beforeEach(async () => {
    orderRepository = new PrismaOrderRepository();
    productRepository = new ProductRepository();
    eventPublisher = new InMemoryDomainEventPublisher();
    orderAppService = new OrderAppService(orderRepository, eventPublisher);
    useCase = new CreateOrderUseCase(orderAppService, eventPublisher);
    getOrderDetailQueryHandler = new GetOrderDetailQueryHandler(orderRepository);
    // 不再於此建立測試商品，統一使用全域 setup 的預設資料
  });

  afterEach(async () => {
    // 無需手動 disconnect，Repository 會自動管理
  });

  it('應正確執行建立訂單用例', async () => {
    // Arrange
    const request: CreateOrderRequest = {
      userId: 'user-1',
      items: [
        { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 2, price: 100 }
      ]
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
      ]
    };
    await expect(useCase.execute(request)).rejects.toThrow('User ID is required');
  });

  it('items 為空時應丟出錯誤', async () => {
    const request: CreateOrderRequest = {
      userId: 'user-1',
      items: []
    };
    await expect(useCase.execute(request)).rejects.toThrow('Order must have at least one item');
  });
});
