"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const order_1 = require("@domains/order/domain/entities/order");
const order_status_1 = require("@domains/order/domain/value-objects/order-status");
const order_notification_service_1 = require("@domains/order/domain/services/order-notification-service");
function createOrder() {
    return new order_1.Order({ value: 'o-2' }, { value: 'u-2' }, [
        { id: 'i-1', productId: 'p-1', name: '商品A', quantity: 1, price: 50, totalPrice: 50 },
        { id: 'i-2', productId: 'p-2', name: '商品B', quantity: 2, price: 30, totalPrice: 60 }
    ], '通知測試', order_status_1.OrderStatus.已點餐, new Date(), new Date());
}
(0, vitest_1.describe)('sendOrderNotification', () => {
    (0, vitest_1.it)('應正確呼叫 notify 並帶入訂單資訊', () => {
        const order = createOrder();
        let called = false;
        let payload = null;
        (0, order_notification_service_1.sendOrderNotification)(order, (p) => {
            called = true;
            payload = p;
        });
        (0, vitest_1.expect)(called).toBe(true);
        (0, vitest_1.expect)(payload).toMatchObject({
            id: 'o-2',
            userId: 'u-2',
            status: order_status_1.OrderStatus.已點餐.value,
            items: [
                { id: 'i-1', name: '商品A', quantity: 1, price: 50, totalPrice: 50 },
                { id: 'i-2', name: '商品B', quantity: 2, price: 30, totalPrice: 60 }
            ]
        });
    });
});
//# sourceMappingURL=orderNotificationService.test.js.map