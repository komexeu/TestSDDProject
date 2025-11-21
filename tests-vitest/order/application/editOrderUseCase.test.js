"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_order_repository_1 = require("@domains/order/infrastructure/repositories/prisma-order-repository");
const edit_order_usecase_1 = require("@domains/order/application/use-cases/edit-order/edit-order.usecase");
const create_order_usecase_1 = require("@domains/order/application/use-cases/create-order/create-order.usecase");
const order_app_service_1 = require("@domains/order/application/service/order-app-service");
const domain_event_1 = require("@shared/domain/events/domain-event");
(0, vitest_1.describe)('EditOrderUseCase', () => {
    let orderRepository;
    let useCase;
    let createOrderUseCase;
    let orderId;
    (0, vitest_1.beforeEach)(async () => {
        orderRepository = new prisma_order_repository_1.OrderRepository();
        useCase = new edit_order_usecase_1.EditOrderUseCase(orderRepository);
        const eventPublisher = new domain_event_1.InMemoryDomainEventPublisher();
        const appService = new order_app_service_1.OrderAppService(orderRepository, eventPublisher);
        createOrderUseCase = new create_order_usecase_1.CreateOrderUseCase(appService, eventPublisher);
        orderId = '';
    });
    (0, vitest_1.it)('成功編輯訂單描述', async () => {
        // 直接建立訂單時填入測試內容
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：成功編輯訂單描述'
        });
        const testOrderIdActual = createResult.orderId;
        const input = {
            orderId: testOrderIdActual,
            userId: 'user-1',
            items: [
                { id: 'item-2', productId: '2', name: '品項B', quantity: 2, price: 50 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：成功編輯訂單描述 - 新描述'
        };
        await useCase.execute(input);
        const updatedOrder = await orderRepository.findById(testOrderIdActual);
        (0, vitest_1.expect)(updatedOrder?.description).toBe('editOrderUseCase.test.ts - 測試：成功編輯訂單描述 - 新描述');
    });
    (0, vitest_1.it)('成功編輯訂單品項', async () => {
        // 建立獨立訂單（用 usecase）
        const testOrderId = 'order-edit-item';
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：成功編輯訂單品項'
        });
        const testOrderIdActual = createResult.orderId;
        const input = {
            orderId: testOrderIdActual,
            userId: 'user-1',
            items: [
                { id: 'item-2', productId: '2', name: '品項B', quantity: 2, price: 50 }
            ]
        };
        await useCase.execute(input);
        const updatedOrder = await orderRepository.findById(testOrderIdActual);
        (0, vitest_1.expect)(updatedOrder?.items.length).toBe(1);
        (0, vitest_1.expect)(updatedOrder?.items[0].name).toBe('品項B');
    });
    (0, vitest_1.it)('訂單不存在時拋出錯誤', async () => {
        const input = {
            orderId: 'not-exist',
            userId: 'user-1',
            description: 'editOrderUseCase.test.ts - 訂單不存在'
        };
        await (0, vitest_1.expect)(useCase.execute(input)).rejects.toThrow('訂單不存在');
    });
    (0, vitest_1.it)('無權限編輯他人訂單時拋出錯誤', async () => {
        // 建立獨立訂單（用 usecase）
        const testOrderId = 'order-edit-noauth';
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 無權限編輯此訂單'
        });
        const testOrderIdActual = createResult.orderId;
        const input = {
            orderId: testOrderIdActual,
            userId: 'other-user',
            description: '無權限編輯此訂單'
        };
        await (0, vitest_1.expect)(useCase.execute(input)).rejects.toThrow('無權限編輯此訂單');
    });
    (0, vitest_1.it)('編輯品項為空時拋出錯誤', async () => {
        // 建立獨立訂單（用 usecase）
        const testOrderId = 'order-edit-emptyitem';
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 訂單必須包含至少一項餐點'
        });
        const testOrderIdActual = createResult.orderId;
        const input = {
            orderId: testOrderIdActual,
            userId: 'user-1',
            items: [],
            description: '訂單必須包含至少一項餐點'
        };
        await (0, vitest_1.expect)(useCase.execute(input)).rejects.toThrow('訂單必須包含至少一項餐點');
    });
    (0, vitest_1.it)('編輯訂單品項後總金額正確', async () => {
        // 建立獨立訂單（用 usecase）
        const testOrderId = 'order-edit-item-amount';
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：編輯訂單品項後總金額正確'
        });
        const testOrderIdActual = createResult.orderId;
        const input = {
            orderId: testOrderIdActual,
            userId: 'user-1',
            items: [
                { id: 'item-3', productId: '2', name: '品項C', quantity: 3, price: 40 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：編輯訂單品項後總金額正確'
        };
        await useCase.execute(input);
        const updatedOrder = await orderRepository.findById(testOrderIdActual);
        (0, vitest_1.expect)(updatedOrder?.totalAmount).toBe(120); // 3*40=120
    });
});
//# sourceMappingURL=editOrderUseCase.test.js.map