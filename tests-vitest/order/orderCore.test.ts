
import { describe, it, expect } from 'vitest';
import { Order, OrderId, UserId } from '../../src/domains/order/domain/entities/order';
import { OrderStatus } from '../../src/domains/order/domain/value-objects/order-status';
import { OrderItem } from '../../src/domains/order/domain/value-objects/order-item';
import { BusinessRuleError } from '../../src/shared/application/exceptions';

function createOrderItems() {
    return [
        new OrderItem('item-1', 'p1', '商品A', 2, 100),
        new OrderItem('item-2', 'p2', '商品B', 1, 50),
    ];
}

describe('Order Entity', () => {
    it('建立訂單時狀態、明細、金額正確', () => {
        const userId = new UserId('user-1');
        const items = createOrderItems();
        const order = Order.create(userId, items);
        expect(order.status.equals(OrderStatus.已點餐)).toBe(true);
        expect(order.items.length).toBe(2);
        expect(order.totalAmount).toBe(250);
    });

    it('訂單狀態流轉', () => {
        const userId = new UserId('user-2');
        const items = createOrderItems();
        const order = Order.create(userId, items);
        order.setConfirm();
        expect(order.status.equals(OrderStatus.已確認訂單)).toBe(true);
        order.setStartPreparation();
        expect(order.status.equals(OrderStatus.製作中)).toBe(true);
        order.setMarkReadyForPickup();
        expect(order.status.equals(OrderStatus.可取餐)).toBe(true);
        order.setComplete();
        expect(order.status.equals(OrderStatus.已取餐完成)).toBe(true);
    });

    it('異常流程：狀態錯誤時拋出例外', () => {
        const userId = new UserId('user-3');
        const items = createOrderItems();
        const order = Order.create(userId, items);
        // 直接完成訂單（未經確認流程）
        expect(() => order.setComplete()).toThrow(BusinessRuleError);
        // 狀態流轉錯誤
        order.setConfirm();
        expect(() => order.setComplete()).toThrow(BusinessRuleError);
    });
});


