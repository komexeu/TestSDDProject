

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CreateOrderUseCase } from '../../src/domains/order/application/use-cases/create-order';
import { PrismaOrderRepository } from '../../src/domains/order/infrastructure/repositories/order-repository.prisma';
import { InMemoryDomainEventPublisher } from '../../src/shared/domain/events/domain-event';
import { CreateOrderRequest } from '../../src/domains/order/application/dto/order-service.dto';
import { PrismaClient } from '@prisma/client';
import { Order, UserId } from '../../src/domains/order/domain/entities/order';
import { OrderStatus } from '../../src/domains/order/domain/value-objects/order-status';
import { OrderItem } from '../../src/domains/order/domain/value-objects/order-item';

const prisma = new PrismaClient();


describe('CreateOrderUseCase', () => {
    let orderRepository: PrismaOrderRepository;
    let eventPublisher: InMemoryDomainEventPublisher;
    let useCase: CreateOrderUseCase;

    beforeEach(async () => {
        // 清空訂單資料表（包含 orderItem）
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        orderRepository = new PrismaOrderRepository();
        eventPublisher = new InMemoryDomainEventPublisher();
        useCase = new CreateOrderUseCase(orderRepository, eventPublisher);
    });

    it('建立訂單後可正確流轉狀態', () => {
        const userId = new UserId('U002');
        const items = [new OrderItem('P003', '綠茶', 1, 50)];
        const order = Order.create(userId, items);
        expect(order.status.value).toBe('已點餐');
        order.transitionTo(OrderStatus.已確認訂單);
        expect(order.status.value).toBe('已確認訂單');
        order.startPreparation();
        expect(order.status.value).toBe('製作中');
        order.transitionTo(OrderStatus.可取餐);
        expect(order.status.value).toBe('可取餐');
        order.complete();
        expect(order.status.value).toBe('已取餐完成');
    });

    it('異常狀態流轉時應拋出例外', () => {
        const userId = new UserId('U003');
        const items = [new OrderItem('P004', '烏龍茶', 1, 55)];
        const order = Order.create(userId, items);
        // 不可直接完成訂單
        expect(() => order.complete()).toThrow();
        // 不可直接轉到已取餐完成
        expect(() => order.transitionTo(OrderStatus.已取餐完成)).toThrow();
        // 狀態錯誤下取消
        order.transitionTo(OrderStatus.已確認訂單);
        order.startPreparation();
        order.transitionTo(OrderStatus.可取餐);
        expect(() => order.cancel('user')).toThrow();
    });

    afterEach(async () => {
        // await prisma.orderItem.deleteMany();
        // await prisma.order.deleteMany();
    });

    it('應成功建立訂單並回傳正確資訊', async () => {
        const request: CreateOrderRequest = {
            userId: 'U001',
            items: [
                { id: 'P001', name: '珍珠奶茶', quantity: 2, price: 60 },
                { id: 'P002', name: '紅茶', quantity: 1, price: 40 },
            ],
        };
        const response = await useCase.execute(request);
        expect(response.userId).toBe('U001');
        expect(response.items).toHaveLength(2);
        expect(response.status).toBe('已點餐');
        expect(response.totalAmount).toBe(160);
        // 驗證資料已寫入資料庫
        const dbOrder = await prisma.order.findFirst({ where: { userId: 'U001' }, include: { items: true } });
        expect(dbOrder).not.toBeNull();
        expect(dbOrder?.items.length).toBe(2);
        // 驗證事件有被觸發
        // 這裡可根據 InMemoryDomainEventPublisher 的 handlers 驗證
        // 若有自訂事件可加強驗證
    });

    it('若 userId 為空應丟出錯誤', async () => {
        const request: CreateOrderRequest = {
            userId: '',
            items: [
                { id: 'P001', name: '珍珠奶茶', quantity: 1, price: 60 },
            ],
        };
        await expect(useCase.execute(request)).rejects.toThrow('User ID is required');
        // 確認資料庫沒有寫入
        const dbOrder = await prisma.order.findFirst({ where: { userId: '' } });
        expect(dbOrder).toBeNull();
    });

    it('若商品數量為 0 應丟出錯誤', async () => {
        const request: CreateOrderRequest = {
            userId: 'U001',
            items: [
                { id: 'P001', name: '珍珠奶茶', quantity: 0, price: 60 },
            ],
        };
        await expect(useCase.execute(request)).rejects.toThrow('Item quantity must be greater than 0');
        const dbOrder = await prisma.order.findFirst({ where: { userId: 'U001' } });
        expect(dbOrder).toBeNull();
    });

    it('若商品名稱為空應丟出錯誤', async () => {
        const request: CreateOrderRequest = {
            userId: 'U001',
            items: [
                { id: 'P001', name: '', quantity: 1, price: 60 },
            ],
        };
        await expect(useCase.execute(request)).rejects.toThrow('Item name is required');
        const dbOrder = await prisma.order.findFirst({ where: { userId: 'U001' } });
        expect(dbOrder).toBeNull();
    });
});
