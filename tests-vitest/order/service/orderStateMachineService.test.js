"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const order_1 = require("@domains/order/domain/entities/order");
const order_status_1 = require("@domains/order/domain/value-objects/order-status");
const order_state_mechine_service_1 = require("@domains/order/domain/services/order-state-mechine-service");
const exceptions_1 = require("@shared/application/exceptions");
function createOrderWithStatus(status) {
    // 必須至少有一個 item
    return new order_1.Order({ value: 'o-1' }, { value: 'u-1' }, [
        { id: 'i-1', productId: 'p-1', name: '商品A', quantity: 1, price: 50, totalPrice: 50 }
    ], '', status, new Date(), new Date());
}
(0, vitest_1.describe)('OrderStateMachineService', () => {
    // 逐一展開所有合法狀態轉換測試
    const allStatus = [
        order_status_1.OrderStatus.已點餐,
        order_status_1.OrderStatus.已確認訂單,
        order_status_1.OrderStatus.製作中,
        order_status_1.OrderStatus.可取餐,
        order_status_1.OrderStatus.已取餐完成,
        order_status_1.OrderStatus.已取消,
        order_status_1.OrderStatus.製作失敗,
        order_status_1.OrderStatus.異常
    ];
    const allowed = {
        [order_status_1.OrderStatus.已點餐.value]: [order_status_1.OrderStatus.已確認訂單, order_status_1.OrderStatus.已取消],
        [order_status_1.OrderStatus.已確認訂單.value]: [order_status_1.OrderStatus.製作中, order_status_1.OrderStatus.已取消],
        [order_status_1.OrderStatus.製作中.value]: [order_status_1.OrderStatus.可取餐],
        [order_status_1.OrderStatus.可取餐.value]: [order_status_1.OrderStatus.已取餐完成],
        [order_status_1.OrderStatus.已取餐完成.value]: [],
        [order_status_1.OrderStatus.已取消.value]: [],
        [order_status_1.OrderStatus.製作失敗.value]: [],
        [order_status_1.OrderStatus.異常.value]: [],
    };
    for (const from of allStatus) {
        for (const to of allowed[from.value] || []) {
            (0, vitest_1.it)(`允許狀態轉換：${from.value} → ${to.value}`, () => {
                const service = new order_state_mechine_service_1.OrderStateMachineService();
                const order = createOrderWithStatus(from);
                (0, vitest_1.expect)(() => service.validateTransition(order, to)).not.toThrow();
            });
        }
    }
    // 逐一展開所有非法狀態轉換測試
    for (const from of allStatus) {
        for (const to of allStatus) {
            if (from.value === to.value)
                continue; // 跳過自己轉自己
            const isAllowed = allowed[from.value]?.includes(to);
            if (!isAllowed) {
                (0, vitest_1.it)(`不允許狀態轉換：${from.value} → ${to.value}`, () => {
                    const service = new order_state_mechine_service_1.OrderStateMachineService();
                    const order = createOrderWithStatus(from);
                    (0, vitest_1.expect)(() => service.validateTransition(order, to)).toThrow(exceptions_1.BusinessRuleError);
                });
            }
        }
    }
    (0, vitest_1.it)('getAvailableTransitions 應回傳正確下一步', () => {
        const order = createOrderWithStatus(order_status_1.OrderStatus.已點餐);
        const service = new order_state_mechine_service_1.OrderStateMachineService();
        const next = service.getAvailableTransitions(order);
        (0, vitest_1.expect)(next.map(s => s.value)).toContain(order_status_1.OrderStatus.已確認訂單.value);
        (0, vitest_1.expect)(next.map(s => s.value)).toContain(order_status_1.OrderStatus.已取消.value);
    });
    (0, vitest_1.it)('canBeCancelled 只允許特定狀態', () => {
        const service = new order_state_mechine_service_1.OrderStateMachineService();
        (0, vitest_1.expect)(service.canBeCancelled(createOrderWithStatus(order_status_1.OrderStatus.已點餐))).toBe(true);
        (0, vitest_1.expect)(service.canBeCancelled(createOrderWithStatus(order_status_1.OrderStatus.已確認訂單))).toBe(true);
        (0, vitest_1.expect)(service.canBeCancelled(createOrderWithStatus(order_status_1.OrderStatus.製作中))).toBe(false);
    });
    (0, vitest_1.it)('isInProgress 判斷正確', () => {
        const service = new order_state_mechine_service_1.OrderStateMachineService();
        (0, vitest_1.expect)(service.isInProgress(createOrderWithStatus(order_status_1.OrderStatus.已點餐))).toBe(true);
        (0, vitest_1.expect)(service.isInProgress(createOrderWithStatus(order_status_1.OrderStatus.已確認訂單))).toBe(true);
        (0, vitest_1.expect)(service.isInProgress(createOrderWithStatus(order_status_1.OrderStatus.製作中))).toBe(true);
        (0, vitest_1.expect)(service.isInProgress(createOrderWithStatus(order_status_1.OrderStatus.可取餐))).toBe(false);
    });
});
//# sourceMappingURL=orderStateMachineService.test.js.map