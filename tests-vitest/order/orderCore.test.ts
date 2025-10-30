
import { describe, it, expect } from 'vitest';
import { Order } from '../../src/domains/order/domain/entities/order';
import { UserId } from '../../src/domains/order/domain/entities/order';
import { OrderStatus } from '../../src/domains/order/domain/value-objects/order-status';
import { OrderItem } from '../../src/domains/order/domain/value-objects/order-item';

const userId = new UserId('U001');
const items = [
    new OrderItem('P001', '珍珠奶茶', 1, 60),
    new OrderItem('P002', '紅茶', 2, 40),
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
        // 狀態流轉：已點餐 → 已確認訂單 → 製作中 → 可取餐 → 已取餐完成
        order.transitionTo(OrderStatus.CONFIRMED);
        expect(order.status.value).toBe('已確認訂單');
        order.startPreparation();
        expect(order.status.value).toBe('製作中');
        order.transitionTo(OrderStatus.READY_FOR_PICKUP);
        expect(order.status.value).toBe('可取餐');
        order.complete();
        expect(order.status.value).toBe('已取餐完成');
    });

    it('不可從「已點餐」直接完成訂單', () => {
        const order = Order.create(userId, items);
        expect(() => order.complete()).toThrow();
    });

    it('不可從「已點餐」直接轉到「已取餐完成」', () => {
        const order = Order.create(userId, items);
        expect(() => order.transitionTo(OrderStatus.COMPLETED)).toThrow();
    });

    it('訂單可於「已點餐」或「已確認訂單」狀態取消', () => {
        const order = Order.create(userId, items);
        order.cancel('user');
        expect(order.status.value).toBe('已取消');
        expect(order.cancelledBy).toBe('user');
    });

    it('不可於「可取餐」後再取消訂單', () => {
        const order = Order.create(userId, items);
        order.transitionTo(OrderStatus.CONFIRMED);
        order.startPreparation();
        order.transitionTo(OrderStatus.READY_FOR_PICKUP);
        expect(order.status.value).toBe('可取餐');
        expect(() => order.cancel('user')).toThrow();
    });

    it('製作中失敗應進入「製作失敗」狀態', () => {
        const order = Order.create(userId, items);
        order.transitionTo(OrderStatus.CONFIRMED);
        order.startPreparation();
        order.fail('原料不足');
        expect(order.status.value).toBe('製作失敗');
        expect(order.errorMessage).toBe('原料不足');
    });
});
