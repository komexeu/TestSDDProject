import { describe, it, expect } from 'vitest';
import { Order } from '@domains/order/domain/entities/order';
import { OrderStatus } from '@domains/order/domain/value-objects/order-status';
import { OrderStateMachineService } from '@domains/order/domain/services/order-state-mechine-service';
import { BusinessRuleError } from '@shared/application/exceptions';

function createOrderWithStatus(status: OrderStatus) {
    // 必須至少有一個 item
    return new Order(
        { value: 'o-1' } as any,
        { value: 'u-1' } as any,
        [
            { id: 'i-1', productId: 'p-1', name: '商品A', quantity: 1, price: 50, totalPrice: 50 }
        ] as any,
        '',
        status,
        new Date(),
        new Date()
    );
}

describe('OrderStateMachineService', () => {
    // 逐一展開所有合法狀態轉換測試
    const allStatus = [
        OrderStatus.已點餐,
        OrderStatus.已確認訂單,
        OrderStatus.製作中,
        OrderStatus.可取餐,
        OrderStatus.已取餐完成,
        OrderStatus.已取消,
        OrderStatus.製作失敗,
        OrderStatus.異常
    ];
    const allowed: Record<string, string[]> = {
        [OrderStatus.已點餐.value]: [OrderStatus.已確認訂單.value, OrderStatus.已取消.value],
        [OrderStatus.已確認訂單.value]: [OrderStatus.製作中.value, OrderStatus.已取消.value],
        [OrderStatus.製作中.value]: [OrderStatus.可取餐.value, OrderStatus.製作失敗.value],
        [OrderStatus.可取餐.value]: [OrderStatus.已取餐完成.value],
        [OrderStatus.已取餐完成.value]: [],
        [OrderStatus.已取消.value]: [],
        [OrderStatus.製作失敗.value]: [],
        [OrderStatus.異常.value]: [],
    };

    for (const from of allStatus) {
        for (const to of allowed[from.value] || []) {
            it(`允許狀態轉換：${from.value} → ${to}`, () => {
                const service = new OrderStateMachineService();
                const order = createOrderWithStatus(from);
                expect(() => service.validateTransition(order, allStatus.find(s => s.value === to)!)).not.toThrow();
            });
        }
    }

    // 逐一展開所有非法狀態轉換測試
    for (const from of allStatus) {
        for (const to of allStatus) {
            if (from.value === to.value) continue; // 跳過自己轉自己
            const isAllowed = allowed[from.value]?.includes(to.value);
            if (!isAllowed) {
                it(`不允許狀態轉換：${from.value} → ${to.value}`, () => {
                    const service = new OrderStateMachineService();
                    const order = createOrderWithStatus(from);
                    expect(() => service.validateTransition(order, to)).toThrow(BusinessRuleError);
                });
            }
        }
    }

    it('getAvailableTransitions 應回傳正確下一步', () => {
        const order = createOrderWithStatus(OrderStatus.已點餐);
        const service = new OrderStateMachineService();
        const next = service.getAvailableTransitions(order);
        expect(next.map(s => s.value)).toContain(OrderStatus.已確認訂單.value);
        expect(next.map(s => s.value)).toContain(OrderStatus.已取消.value);
    });

    it('canBeCancelled 只允許特定狀態', () => {
        const service = new OrderStateMachineService();
        expect(service.canBeCancelled(createOrderWithStatus(OrderStatus.已點餐))).toBe(true);
        expect(service.canBeCancelled(createOrderWithStatus(OrderStatus.已確認訂單))).toBe(true);
        expect(service.canBeCancelled(createOrderWithStatus(OrderStatus.製作中))).toBe(false);
    });

    it('isInProgress 判斷正確', () => {
        const service = new OrderStateMachineService();
        expect(service.isInProgress(createOrderWithStatus(OrderStatus.已點餐))).toBe(true);
        expect(service.isInProgress(createOrderWithStatus(OrderStatus.已確認訂單))).toBe(true);
        expect(service.isInProgress(createOrderWithStatus(OrderStatus.製作中))).toBe(true);
        expect(service.isInProgress(createOrderWithStatus(OrderStatus.可取餐))).toBe(false);
    });
});
