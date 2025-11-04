import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { OrderItem } from '@domains/order/domain/value-objects/order-item';

// 建立 mock repository
function createMockOrderRepository() {
	return {
		create: vi.fn(async (order) => order.id.value),
		findById: vi.fn(),
		edit: vi.fn(),
		findByUserId: vi.fn(),
		delete: vi.fn(),
	};
}

describe('OrderAppService', () => {
	let orderAppService: OrderAppService;
	let repository: ReturnType<typeof createMockOrderRepository>;
	let eventPublisher: InMemoryDomainEventPublisher;

	beforeEach(() => {
		repository = createMockOrderRepository();
		eventPublisher = new InMemoryDomainEventPublisher();
		orderAppService = new OrderAppService(repository as any, eventPublisher);
	});

	it('應正確建立訂單', async () => {
		const userId = 'user-1';
		const items = [
			{ id: 'item-1', productId: 'p1', name: '品項A', quantity: 2, price: 50 },
			{ id: 'item-2', productId: 'p2', name: '品項B', quantity: 1, price: 30 },
		];
		const order = await orderAppService.createOrder(userId, items);
		expect(order.userId.value).toBe(userId);
		expect(order.items.length).toBe(2);
		expect(order.totalAmount).toBe(130);
		expect(repository.create).toHaveBeenCalled();
	});

	it('userId 為空時應拋出錯誤', async () => {
		await expect(orderAppService.createOrder('', [])).rejects.toThrow('User ID is required');
	});

	it('items 為空時應拋出錯誤', async () => {
		await expect(orderAppService.createOrder('user-1', [])).rejects.toThrow('Order must have at least one item');
	});
});
