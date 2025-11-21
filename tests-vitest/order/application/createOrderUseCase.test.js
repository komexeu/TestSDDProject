"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const create_order_usecase_1 = require("@domains/order/application/use-cases/create-order/create-order.usecase");
const order_app_service_1 = require("@domains/order/application/service/order-app-service");
const prisma_order_repository_1 = require("@domains/order/infrastructure/repositories/prisma-order-repository");
const domain_event_1 = require("@shared/domain/events/domain-event");
const get_order_detail_query_1 = require("@domains/order/application/queries/get-order-detail.query");
(0, vitest_1.describe)('CreateOrderUseCase (integration)', () => {
    let orderRepository;
    let eventPublisher;
    let orderAppService;
    let useCase;
    let getOrderDetailQueryHandler;
    (0, vitest_1.beforeEach)(async () => {
        orderRepository = new prisma_order_repository_1.OrderRepository();
        eventPublisher = new domain_event_1.InMemoryDomainEventPublisher();
        orderAppService = new order_app_service_1.OrderAppService(orderRepository, eventPublisher);
        useCase = new create_order_usecase_1.CreateOrderUseCase(orderAppService, eventPublisher);
        getOrderDetailQueryHandler = new get_order_detail_query_1.GetOrderDetailQueryHandler(orderRepository);
        // 不再於此建立測試商品，統一使用全域 setup 的預設資料
    });
    (0, vitest_1.it)('應正確執行建立訂單用例', async () => {
        // Arrange
        const request = {
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
        (0, vitest_1.expect)(orderDetail).not.toBeNull();
        (0, vitest_1.expect)(result).toMatchObject({
            orderId: orderDetail.orderId,
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 2, price: 100 }
            ],
            description: 'createOrderUseCase.test.ts-應正確執行建立訂單用例',
            status: orderDetail.status,
            totalAmount: 200,
        });
        // 驗證事件
        // 由於 InMemoryDomainEventPublisher 需訂閱才會有 handlers，這裡僅驗證不拋錯即可
    });
    (0, vitest_1.it)('userId 為空時應丟出錯誤', async () => {
        const request = {
            userId: '',
            items: [
                { id: 'item-1', productId: '1', name: '測試商品A-1', quantity: 2, price: 100 }
            ],
            description: 'createOrderUseCase.test.ts-userId為空時應丟出錯誤'
        };
        await (0, vitest_1.expect)(useCase.execute(request)).rejects.toThrow('User ID is required');
    });
    (0, vitest_1.it)('items 為空時應丟出錯誤', async () => {
        const request = {
            userId: 'user-1',
            items: [],
            description: 'createOrderUseCase.test.ts-items為空時應丟出錯誤'
        };
        await (0, vitest_1.expect)(useCase.execute(request)).rejects.toThrow('Order must have at least one item');
    });
});
//# sourceMappingURL=createOrderUseCase.test.js.map