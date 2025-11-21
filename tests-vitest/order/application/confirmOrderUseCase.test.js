"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const confirm_order_usecase_1 = require("@domains/order/application/use-cases/confirm-order/confirm-order.usecase");
const order_app_service_1 = require("@domains/order/application/service/order-app-service");
const prisma_order_repository_1 = require("@domains/order/infrastructure/repositories/prisma-order-repository");
const domain_event_1 = require("@shared/domain/events/domain-event");
const create_order_usecase_1 = require("@domains/order/application/use-cases/create-order/create-order.usecase");
(0, vitest_1.describe)('ConfirmOrderUseCase (integration)', () => {
    let orderRepository;
    let eventPublisher;
    let orderAppService;
    let useCase;
    let createOrderUseCase;
    let createdOrderId;
    (0, vitest_1.beforeEach)(async () => {
        orderRepository = new prisma_order_repository_1.OrderRepository();
        eventPublisher = new domain_event_1.InMemoryDomainEventPublisher();
        orderAppService = new order_app_service_1.OrderAppService(orderRepository, eventPublisher);
        useCase = new confirm_order_usecase_1.ConfirmOrderUseCase(orderAppService, eventPublisher);
        createOrderUseCase = new create_order_usecase_1.CreateOrderUseCase(orderAppService, eventPublisher);
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
    (0, vitest_1.it)('應正確執行確認訂單用例', async () => {
        // Act
        await useCase.execute(createdOrderId);
        // Assert
        const order = await orderRepository.findById(createdOrderId);
        (0, vitest_1.expect)(order?.status.value).toBe(2);
    });
});
//# sourceMappingURL=confirmOrderUseCase.test.js.map