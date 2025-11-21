"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const get_order_list_query_1 = require("../../../src/domains/order/application/queries/get-order-list.query");
const order_1 = require("../../../src/domains/order/domain/entities/order");
const order_item_1 = require("../../../src/domains/order/domain/value-objects/order-item");
const order_status_1 = require("../../../src/domains/order/domain/value-objects/order-status");
// Mock repository
const mockFindAll = vitest_1.vi.fn();
const mockRepo = { findAll: mockFindAll };
(0, vitest_1.describe)('GetOrderListQueryHandler', () => {
    (0, vitest_1.it)('should return orders with items array', async () => {
        const order = new order_1.Order({ value: 'order1' }, { value: 'user1' }, [new order_item_1.OrderItem('item1', 'p1', '可樂', 2, 30), new order_item_1.OrderItem('item2', 'p2', '薯條', 1, 50)], '測試訂單', order_status_1.OrderStatus.已點餐, new Date('2025-11-11T10:00:00Z'));
        mockFindAll.mockResolvedValue({ orders: [order], total: 1 });
        const handler = new get_order_list_query_1.GetOrderListQueryHandler(mockRepo);
        const result = await handler.execute({});
        (0, vitest_1.expect)(result.orders).toHaveLength(1);
        const o = result.orders[0];
        (0, vitest_1.expect)(o.orderId).toBe('order1');
        (0, vitest_1.expect)(o.items).toEqual([
            { id: 'item1', productId: 'p1', name: '可樂', quantity: 2, price: 30 },
            { id: 'item2', productId: 'p2', name: '薯條', quantity: 1, price: 50 }
        ]);
        (0, vitest_1.expect)(o.items[0].quantity).toBe(2);
        (0, vitest_1.expect)(o.items[1].price).toBe(50);
    });
});
//# sourceMappingURL=getOrderListQuery.test.js.map