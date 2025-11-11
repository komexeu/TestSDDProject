import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Hono } from 'hono';
import { OrderController } from '../../../src/interfaces/http/controllers/order-controller';
import { createOrderRoutes } from '../../../src/interfaces/http/routes/order-routes';
import { OrderAppService } from '../../../src/domains/order/application/service/order-app-service';
import { PrismaOrderRepository } from '../../../src/domains/order/infrastructure/repositories/prisma-order-repository';
import { DomainEventPublisher } from '../../../src/shared/domain/events/domain-event';


// Mock 依賴
const findByIdMock = vi.fn();
const editMock = vi.fn();
const orderAppService = {} as OrderAppService;
const orderRepository = {
  findById: findByIdMock,
  edit: editMock,
} as unknown as PrismaOrderRepository;
const eventPublisher = {} as DomainEventPublisher;

const orderController = new OrderController(orderAppService, orderRepository, eventPublisher);
const app = createOrderRoutes(orderController);

describe('PUT /orders/:orderId', () => {
  it('should edit order and return success', async () => {
    findByIdMock.mockResolvedValue({
      id: { value: 'order1' },
      userId: { value: 'user1' },
      _description: 'old',
      _items: [],
    });
    editMock.mockResolvedValue(undefined);

    const req = new Request('http://localhost/orders/order1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'user1' },
      body: JSON.stringify({ description: 'new desc', items: [{ id: 'item1', productId: 'p1', name: 'n', quantity: 1, price: 10 }] })
    });
    const res = await app.request(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.message).toBe('訂單已更新');
  });
});
