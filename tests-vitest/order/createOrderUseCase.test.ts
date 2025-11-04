import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OrderAppService } from '../../src/domains/order/application/service/order-app-service';
import { OrderUseCase } from '../../src/domains/order/application/use-cases/order-usecase';
import { PrismaOrderRepository } from '../../src/domains/order/infrastructure/repositories/prisma-order-repository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



describe('OrderUseCase - 建立訂單流程', () => {
    let orderRepository: PrismaOrderRepository;
    let orderAppService: OrderAppService;
    let useCase: OrderUseCase;
    // 簡易 eventBus mock
    const eventBus = { publish: async () => {} };

    beforeEach(async () => {
        // 先刪除子表，再刪除主表，避免外鍵約束錯誤
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        orderRepository = new PrismaOrderRepository();
        orderAppService = new OrderAppService(orderRepository, eventBus);
        useCase = new OrderUseCase(orderAppService, eventBus);
    });

    it('應成功建立訂單並回傳正確資訊', async () => {
        const userId = 'U001';
        const items = [
            { id: 'oi1', productId: 'P001', name: '珍珠奶茶', quantity: 2, price: 60 },
            { id: 'oi2', productId: 'P002', name: '紅茶', quantity: 1, price: 40 },
        ];
        const order = await useCase.createOrder(userId, items);
        expect(order.userId.value).toBe('U001');
        expect(order.items.length).toBe(2);
        expect(order.status.value).toBe('已點餐');
        expect(order.totalAmount).toBe(160);
        // 驗證資料已寫入資料庫
        const dbOrder = await prisma.order.findFirst({ where: { userId: 'U001' }, include: { items: true } });
        expect(dbOrder).not.toBeNull();
        expect(dbOrder?.items.length).toBe(2);
    });

    it('若 userId 為空應丟出錯誤', async () => {
        const userId = '';
        const items = [
            { id: 'oi1', productId: 'P001', name: '珍珠奶茶', quantity: 1, price: 60 },
        ];
        await expect(useCase.createOrder(userId, items)).rejects.toThrow();
        const dbOrder = await prisma.order.findFirst({ where: { userId: '' } });
        expect(dbOrder).toBeNull();
    });

    it('若商品數量為 0 應丟出錯誤', async () => {
        const userId = 'U001';
        const items = [
            { id: 'oi1', productId: 'P001', name: '珍珠奶茶', quantity: 0, price: 60 },
        ];
        await expect(useCase.createOrder(userId, items)).rejects.toThrow();
        const dbOrder = await prisma.order.findFirst({ where: { userId: 'U001' } });
        expect(dbOrder).toBeNull();
    });

    it('若商品名稱為空應丟出錯誤', async () => {
        const userId = 'U001';
        const items = [
            { id: 'oi1', productId: 'P001', name: '', quantity: 1, price: 60 },
        ];
        await expect(useCase.createOrder(userId, items)).rejects.toThrow();
        const dbOrder = await prisma.order.findFirst({ where: { userId: 'U001' } });
        expect(dbOrder).toBeNull();
    });

    afterEach(async () => {
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
    });
});
