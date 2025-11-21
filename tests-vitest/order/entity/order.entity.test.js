"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const order_1 = require("@domains/order/domain/entities/order");
const order_status_1 = require("@domains/order/domain/value-objects/order-status");
const order_item_1 = require("@domains/order/domain/value-objects/order-item");
const exceptions_1 = require("@shared/application/exceptions");
function createOrder({ status = order_status_1.OrderStatus.已點餐, items = [new order_item_1.OrderItem('i-1', 'p-1', '商品A', 2, 50)], description = '', cancelledBy = undefined, errorMessage = undefined } = {}) {
    return new order_1.Order(new order_1.OrderId('o-1'), new order_1.UserId('u-1'), items, description, status, new Date('2025-11-04T00:00:00Z'), new Date('2025-11-04T00:00:00Z'), cancelledBy, errorMessage);
}
(0, vitest_1.describe)('Order Entity', () => {
    (0, vitest_1.describe)('OrderItem 值物件驗證', () => {
        (0, vitest_1.it)('id 不可為空', () => {
            (0, vitest_1.expect)(() => new order_item_1.OrderItem('', 'p-1', '商品A', 1, 10)).toThrow('訂單項目 ID 不可為空');
        });
        (0, vitest_1.it)('productId 不可為空', () => {
            (0, vitest_1.expect)(() => new order_item_1.OrderItem('i-1', '', '商品A', 1, 10)).toThrow('商品 ID 不可為空');
        });
        (0, vitest_1.it)('name 不可為空', () => {
            (0, vitest_1.expect)(() => new order_item_1.OrderItem('i-1', 'p-1', '', 1, 10)).toThrow('訂單項目名稱不可為空');
        });
        (0, vitest_1.it)('quantity 必須大於 0', () => {
            (0, vitest_1.expect)(() => new order_item_1.OrderItem('i-1', 'p-1', '商品A', 0, 10)).toThrow('數量必須大於 0');
            (0, vitest_1.expect)(() => new order_item_1.OrderItem('i-1', 'p-1', '商品A', -1, 10)).toThrow('數量必須大於 0');
        });
        (0, vitest_1.it)('price 不可為負數', () => {
            (0, vitest_1.expect)(() => new order_item_1.OrderItem('i-1', 'p-1', '商品A', 1, -1)).toThrow('價格不可為負數');
        });
        (0, vitest_1.it)('totalPrice 正確', () => {
            const item = new order_item_1.OrderItem('i-1', 'p-1', '商品A', 3, 20);
            (0, vitest_1.expect)(item.totalPrice).toBe(60);
        });
    });
    (0, vitest_1.it)('建立訂單時必須有至少一項餐點', () => {
        (0, vitest_1.expect)(() => createOrder({ items: [] })).toThrow(exceptions_1.BusinessRuleError);
    });
    (0, vitest_1.it)('計算總金額正確', () => {
        const order = createOrder({
            items: [
                new order_item_1.OrderItem('i-1', 'p-1', '商品A', 2, 50),
                new order_item_1.OrderItem('i-2', 'p-2', '商品B', 1, 30)
            ]
        });
        (0, vitest_1.expect)(order.totalAmount).toBe(2 * 50 + 1 * 30);
    });
    (0, vitest_1.it)('setConfirm 狀態轉換為已確認訂單', () => {
        const order = createOrder({ status: order_status_1.OrderStatus.已點餐 });
        order.setConfirm();
        (0, vitest_1.expect)(order.status.value).toBe(order_status_1.OrderStatus.已確認訂單.value);
    });
    (0, vitest_1.it)('setStartPreparation 狀態轉換為製作中', () => {
        const order = createOrder({ status: order_status_1.OrderStatus.已確認訂單 });
        order.setStartPreparation();
        (0, vitest_1.expect)(order.status.value).toBe(order_status_1.OrderStatus.製作中.value);
    });
    (0, vitest_1.it)('setMarkReadyForPickup 狀態轉換為可取餐', () => {
        const order = createOrder({ status: order_status_1.OrderStatus.製作中 });
        order.setMarkReadyForPickup();
        (0, vitest_1.expect)(order.status.value).toBe(order_status_1.OrderStatus.可取餐.value);
    });
    (0, vitest_1.it)('setComplete 僅可於可取餐狀態執行', () => {
        const order = createOrder({ status: order_status_1.OrderStatus.可取餐 });
        order.setComplete();
        (0, vitest_1.expect)(order.status.value).toBe(order_status_1.OrderStatus.已取餐完成.value);
        // 非可取餐狀態應丟錯
        const order2 = createOrder({ status: order_status_1.OrderStatus.已點餐 });
        (0, vitest_1.expect)(() => order2.setComplete()).toThrow(exceptions_1.BusinessRuleError);
    });
    (0, vitest_1.it)('setFail 僅可於製作中狀態執行', () => {
        const order = createOrder({ status: order_status_1.OrderStatus.製作中 });
        order.setFail('失敗原因');
        (0, vitest_1.expect)(order.status.value).toBe(order_status_1.OrderStatus.製作失敗.value);
        (0, vitest_1.expect)(order.errorMessage).toBe('失敗原因');
        // 非製作中狀態應丟錯
        const order2 = createOrder({ status: order_status_1.OrderStatus.已點餐 });
        (0, vitest_1.expect)(() => order2.setFail('x')).toThrow(exceptions_1.BusinessRuleError);
    });
    (0, vitest_1.it)('cancel 僅可於已點餐/已確認訂單狀態執行', () => {
        const order = createOrder({ status: order_status_1.OrderStatus.已點餐 });
        order.cancel('user');
        (0, vitest_1.expect)(order.status.value).toBe(order_status_1.OrderStatus.已取消.value);
        (0, vitest_1.expect)(order.cancelledBy).toBe('user');
        // 非允許狀態應丟錯
        const order2 = createOrder({ status: order_status_1.OrderStatus.製作中 });
        (0, vitest_1.expect)(() => order2.cancel('user')).toThrow(exceptions_1.BusinessRuleError);
    });
    (0, vitest_1.it)('canBeCancelled 與 isInProgress 行為正確', () => {
        (0, vitest_1.expect)(createOrder({ status: order_status_1.OrderStatus.已點餐 }).canBeCancelled()).toBe(true);
        (0, vitest_1.expect)(createOrder({ status: order_status_1.OrderStatus.已確認訂單 }).canBeCancelled()).toBe(true);
        (0, vitest_1.expect)(createOrder({ status: order_status_1.OrderStatus.製作中 }).canBeCancelled()).toBe(false);
        (0, vitest_1.expect)(createOrder({ status: order_status_1.OrderStatus.已點餐 }).isInProgress()).toBe(true);
        (0, vitest_1.expect)(createOrder({ status: order_status_1.OrderStatus.已確認訂單 }).isInProgress()).toBe(true);
        (0, vitest_1.expect)(createOrder({ status: order_status_1.OrderStatus.製作中 }).isInProgress()).toBe(true);
        (0, vitest_1.expect)(createOrder({ status: order_status_1.OrderStatus.可取餐 }).isInProgress()).toBe(false);
    });
});
//# sourceMappingURL=order.entity.test.js.map