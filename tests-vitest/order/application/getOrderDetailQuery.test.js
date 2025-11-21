"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const get_order_detail_query_1 = require("@domains/order/application/queries/get-order-detail.query");
const prisma_order_repository_1 = require("@domains/order/infrastructure/repositories/prisma-order-repository");
const order_app_service_1 = require("@domains/order/application/service/order-app-service");
const create_order_usecase_1 = require("@domains/order/application/use-cases/create-order/create-order.usecase");
const domain_event_1 = require("@shared/domain/events/domain-event");
// 整合測試：先建立訂單，再用 Query 查詢
(0, vitest_1.describe)('GetOrderDetailQueryHandler (integration with CreateOrderUseCase)', () => {
    const orderRepository = new prisma_order_repository_1.OrderRepository();
    const eventPublisher = new domain_event_1.InMemoryDomainEventPublisher();
    const appService = new order_app_service_1.OrderAppService(orderRepository, eventPublisher);
    const createOrderUseCase = new create_order_usecase_1.CreateOrderUseCase(appService, eventPublisher);
    const handler = new get_order_detail_query_1.GetOrderDetailQueryHandler(orderRepository);
    let createdOrderId;
    (0, vitest_1.beforeAll)(async () => {
        const result = await createOrderUseCase.execute({
            userId: 'q-user-1',
            items: [
                { id: 'q-item-1', productId: '1', name: 'Query測試商品', quantity: 3, price: 80 }
            ],
            description: 'Query整合測試'
        });
        createdOrderId = result.orderId;
    });
    (0, vitest_1.afterAll)(async () => {
        // 若需要可在這裡清理資料，但目前以測試獨立性為主，不做刪除（後續可改用專屬測試 schema）
    });
    (0, vitest_1.it)('建立後的訂單應能被 Query 查得', async () => {
        const result = await handler.execute({ orderId: createdOrderId });
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.orderId).toBe(createdOrderId);
        (0, vitest_1.expect)(result.items).toHaveLength(1);
        (0, vitest_1.expect)(result.items[0].quantity).toBe(3);
        (0, vitest_1.expect)(result.totalAmount).toBe(240); // 3 * 80
    });
    (0, vitest_1.it)('不存在的訂單應回傳 null', async () => {
        const result = await handler.execute({ orderId: 'no-such-order' });
        (0, vitest_1.expect)(result).toBeNull();
    });
});
//# sourceMappingURL=getOrderDetailQuery.test.js.map