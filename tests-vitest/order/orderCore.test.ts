


import { describe, it, expect } from 'vitest';
import { Order, UserId } from '../../src/domains/order/domain/entities/order';
import { OrderStatus } from '../../src/domains/order/domain/value-objects/order-status';
import { OrderItem } from '../../src/domains/order/domain/value-objects/order-item';

const userId = new UserId('U001');
const items = [
    new OrderItem('oi1', 'P001', '珍珠奶茶', 1, 60),
    new OrderItem('oi2', 'P002', '紅茶', 2, 40),
];

describe('訂單核心功能', () => {
    it('建立訂單時，狀態應為「已點餐」且包含正確商品', () => {
        const order = Order.create(userId, items);
        expect(order.status.value).toBe('已點餐');
        expect(order.items.length).toBe(2);
        expect(order.userId.value).toBe('U001');
    });

    it('訂單狀態可依流程正確流轉', () => {
        const order = Order.create(userId, items);
        order.setConfirm();
        expect(order.status.value).toBe('已確認訂單');
        order.setStartPreparation();
        expect(order.status.value).toBe('製作中');
        order.setMarkReadyForPickup();
        expect(order.status.value).toBe('可取餐');
        order.setComplete();
        expect(order.status.value).toBe('已取餐完成');
    });

    it('不可從「已點餐」直接完成訂單', () => {
        const order = Order.create(userId, items);
        expect(() => order.setComplete()).toThrow();
    });

    it('訂單僅能於特定狀態取消', () => {
        const order = Order.create(userId, items);
        // 已點餐可取消
        expect(() => order.cancel('user')).not.toThrow();
        // 已確認訂單可取消
        const order2 = Order.create(userId, items);
        order2.setConfirm();
        expect(() => order2.cancel('counter')).not.toThrow();
        // 製作中不可取消
        const order3 = Order.create(userId, items);
        order3.setConfirm();
        order3.setStartPreparation();
        expect(() => order3.cancel('user')).toThrow();
    });

    it('不可於非可取餐狀態完成訂單', () => {
        const order = Order.create(userId, items);
        order.setConfirm();
        order.setStartPreparation();
        expect(() => order.setComplete()).toThrow();
    });

    it('製作中可標記失敗', () => {
        const order = Order.create(userId, items);
        order.setConfirm();
        order.setStartPreparation();
        order.setFail('原料不足');
        expect(order.status.value).toBe('製作失敗');
        expect(order.errorMessage).toBe('原料不足');
    });
});
