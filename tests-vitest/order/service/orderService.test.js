"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const order_app_service_1 = require("@domains/order/application/service/order-app-service");
const domain_event_1 = require("@shared/domain/events/domain-event");
// 建立 mock repository
function createMockOrderRepository() {
    return {
        create: vitest_1.vi.fn(async (order) => order.id.value),
        findById: vitest_1.vi.fn(),
        edit: vitest_1.vi.fn(),
        findByUserId: vitest_1.vi.fn(),
        delete: vitest_1.vi.fn(),
    };
}
(0, vitest_1.describe)('OrderAppService', () => {
    let orderAppService;
    let repository;
    let eventPublisher;
    (0, vitest_1.beforeEach)(() => {
        repository = createMockOrderRepository();
        eventPublisher = new domain_event_1.InMemoryDomainEventPublisher();
        orderAppService = new order_app_service_1.OrderAppService(repository, eventPublisher);
    });
    (0, vitest_1.it)('應正確建立訂單', async () => {
        const userId = 'user-1';
        const items = [
            { id: 'item-1', productId: 'p1', name: '品項A', quantity: 2, price: 50 },
            { id: 'item-2', productId: 'p2', name: '品項B', quantity: 1, price: 30 },
        ];
        const order = await orderAppService.createOrder(userId, items);
        (0, vitest_1.expect)(order.userId.value).toBe(userId);
        (0, vitest_1.expect)(order.items.length).toBe(2);
        (0, vitest_1.expect)(order.totalAmount).toBe(130);
        (0, vitest_1.expect)(repository.create).toHaveBeenCalled();
    });
    (0, vitest_1.it)('userId 為空時應拋出錯誤', async () => {
        await (0, vitest_1.expect)(orderAppService.createOrder('', [])).rejects.toThrow('User ID is required');
    });
    (0, vitest_1.it)('items 為空時應拋出錯誤', async () => {
        await (0, vitest_1.expect)(orderAppService.createOrder('user-1', [])).rejects.toThrow('Order must have at least one item');
    });
});
//# sourceMappingURL=orderService.test.js.map