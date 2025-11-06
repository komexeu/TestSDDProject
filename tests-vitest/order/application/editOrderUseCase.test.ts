import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { EditOrderUseCase, EditOrderInput } from '@domains/order/application/use-cases/edit-order/edit-order.usecase';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';

describe('EditOrderUseCase', () => {
    let orderRepository: PrismaOrderRepository;
    let useCase: EditOrderUseCase;
    let createOrderUseCase: CreateOrderUseCase;
    let orderId: string;

    beforeEach(async () => {
        orderRepository = new PrismaOrderRepository();
        useCase = new EditOrderUseCase(orderRepository);
        const eventPublisher = new InMemoryDomainEventPublisher();
        const appService = new OrderAppService(orderRepository, eventPublisher);
        createOrderUseCase = new CreateOrderUseCase(appService, eventPublisher);
        orderId = '';
    });

    it('成功編輯訂單描述', async () => {
        // 直接建立訂單時填入測試內容
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：成功編輯訂單描述'
        });
        const testOrderIdActual = createResult.orderId;
        const input: EditOrderInput = {
            orderId: testOrderIdActual,
            userId: 'user-1',
            items: [
                { id: 'item-2', productId: '2', name: '品項B', quantity: 2, price: 50 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：成功編輯訂單描述 - 新描述'
        };
        await useCase.execute(input);
        const updatedOrder = await orderRepository.findById(testOrderIdActual);
        expect(updatedOrder?.description).toBe('editOrderUseCase.test.ts - 測試：成功編輯訂單描述 - 新描述');
    });

    it('成功編輯訂單品項', async () => {
        // 建立獨立訂單（用 usecase）
        const testOrderId = 'order-edit-item';
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：成功編輯訂單品項'
        });
        const testOrderIdActual = createResult.orderId;
        const input: EditOrderInput = {
            orderId: testOrderIdActual,
            userId: 'user-1',
            items: [
                { id: 'item-2', productId: '2', name: '品項B', quantity: 2, price: 50 }
            ]
        };
        await useCase.execute(input);
        const updatedOrder = await orderRepository.findById(testOrderIdActual);
        expect(updatedOrder?.items.length).toBe(1);
        expect(updatedOrder?.items[0].name).toBe('品項B');
    });

    it('訂單不存在時拋出錯誤', async () => {
        const input: EditOrderInput = {
            orderId: 'not-exist',
            userId: 'user-1',
            description: 'editOrderUseCase.test.ts - 訂單不存在'
        };
        await expect(useCase.execute(input)).rejects.toThrow('訂單不存在');
    });

    it('無權限編輯他人訂單時拋出錯誤', async () => {
        // 建立獨立訂單（用 usecase）
        const testOrderId = 'order-edit-noauth';
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 無權限編輯此訂單'
        });
        const testOrderIdActual = createResult.orderId;
        const input: EditOrderInput = {
            orderId: testOrderIdActual,
            userId: 'other-user',
            description: '無權限編輯此訂單'
        };
        await expect(useCase.execute(input)).rejects.toThrow('無權限編輯此訂單');
    });

    it('編輯品項為空時拋出錯誤', async () => {
        // 建立獨立訂單（用 usecase）
        const testOrderId = 'order-edit-emptyitem';
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 訂單必須包含至少一項餐點'
        });
        const testOrderIdActual = createResult.orderId;
        const input: EditOrderInput = {
            orderId: testOrderIdActual,
            userId: 'user-1',
            items: [],
            description: '訂單必須包含至少一項餐點'
        };
        await expect(useCase.execute(input)).rejects.toThrow('訂單必須包含至少一項餐點');
    });

    it('編輯訂單品項後總金額正確', async () => {
        // 建立獨立訂單（用 usecase）
        const testOrderId = 'order-edit-item-amount';
        const createResult = await createOrderUseCase.execute({
            userId: 'user-1',
            items: [
                { id: 'item-1', productId: '1', name: '品項A', quantity: 1, price: 100 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：編輯訂單品項後總金額正確'
        });
        const testOrderIdActual = createResult.orderId;
        const input: EditOrderInput = {
            orderId: testOrderIdActual,
            userId: 'user-1',
            items: [
                { id: 'item-3', productId: '2', name: '品項C', quantity: 3, price: 40 }
            ],
            description: 'editOrderUseCase.test.ts - 測試：編輯訂單品項後總金額正確'
        };
        await useCase.execute(input);
        const updatedOrder = await orderRepository.findById(testOrderIdActual);
        expect(updatedOrder?.totalAmount).toBe(120); // 3*40=120
    });
});
