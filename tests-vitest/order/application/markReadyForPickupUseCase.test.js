"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const mark_ready_for_pickup_usecase_1 = require("@domains/order/application/use-cases/mark-ready-for-pickup/mark-ready-for-pickup.usecase");
const start_preparation_usecase_1 = require("@domains/order/application/use-cases/start-preparation/start-preparation.usecase");
const confirm_order_usecase_1 = require("@domains/order/application/use-cases/confirm-order/confirm-order.usecase");
const order_app_service_1 = require("@domains/order/application/service/order-app-service");
const prisma_order_repository_1 = require("@domains/order/infrastructure/repositories/prisma-order-repository");
const domain_event_1 = require("@shared/domain/events/domain-event");
const create_order_usecase_1 = require("@domains/order/application/use-cases/create-order/create-order.usecase");
(0, vitest_1.describe)('MarkReadyForPickupUseCase (integration)', () => {
    let orderRepository;
    let eventPublisher;
    let orderAppService;
    let useCase;
    let createOrderUseCase;
    let createdOrderId;
    let startPreparationUseCase;
    let confirmOrderUseCase;
    (0, vitest_1.beforeEach)(async () => {
        orderRepository = new prisma_order_repository_1.OrderRepository();
        eventPublisher = new domain_event_1.InMemoryDomainEventPublisher();
        orderAppService = new order_app_service_1.OrderAppService(orderRepository, eventPublisher);
        useCase = new mark_ready_for_pickup_usecase_1.MarkReadyForPickupUseCase(orderAppService, eventPublisher);
        createOrderUseCase = new create_order_usecase_1.CreateOrderUseCase(orderAppService, eventPublisher);
        startPreparationUseCase = new start_preparation_usecase_1.StartPreparationUseCase(orderAppService, eventPublisher);
        confirmOrderUseCase = new confirm_order_usecase_1.ConfirmOrderUseCase(orderAppService, eventPublisher);
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
    (0, vitest_1.it)('應正確執行標記可取餐用例', async () => {
        // Act
        await useCase.execute(createdOrderId);
        // Assert
        const order = await orderRepository.findById(createdOrderId);
        (0, vitest_1.expect)(order?.status.value).toBe(4);
    });
});
//# sourceMappingURL=markReadyForPickupUseCase.test.js.map