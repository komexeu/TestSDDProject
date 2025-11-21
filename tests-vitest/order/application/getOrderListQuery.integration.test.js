"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const get_order_list_query_1 = require("../../../src/domains/order/application/queries/get-order-list.query");
const prisma_order_repository_1 = require("../../../src/domains/order/infrastructure/repositories/prisma-order-repository");
(0, vitest_1.describe)('GetOrderListQueryHandler (integration, real repository)', () => {
    (0, vitest_1.it)('應該能查到訂單且每筆訂單 items 欄位正確 (直接 new repository)', async () => {
        const repo = new prisma_order_repository_1.OrderRepository();
        const handler = new get_order_list_query_1.GetOrderListQueryHandler(repo);
        const result = await handler.execute({});
        (0, vitest_1.expect)(result.orders.length).toBeGreaterThan(0);
        for (const order of result.orders) {
            (0, vitest_1.expect)(order.items).toBeDefined();
            (0, vitest_1.expect)(Array.isArray(order.items)).toBe(true);
            (0, vitest_1.expect)(order.items.length).toBeGreaterThan(0);
            for (const item of order.items) {
                (0, vitest_1.expect)(item).toHaveProperty('id');
                (0, vitest_1.expect)(item).toHaveProperty('productId');
                (0, vitest_1.expect)(item).toHaveProperty('name');
                (0, vitest_1.expect)(item).toHaveProperty('quantity');
                (0, vitest_1.expect)(item).toHaveProperty('price');
                (0, vitest_1.expect)(typeof item.id).toBe('string');
                (0, vitest_1.expect)(typeof item.productId).toBe('string');
                (0, vitest_1.expect)(typeof item.name).toBe('string');
                (0, vitest_1.expect)(typeof item.quantity).toBe('number');
                (0, vitest_1.expect)(typeof item.price).toBe('number');
            }
        }
    });
});
//# sourceMappingURL=getOrderListQuery.integration.test.js.map