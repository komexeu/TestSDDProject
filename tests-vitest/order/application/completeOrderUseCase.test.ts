import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompleteOrderUseCase } from '../../../src/domains/order/application/use-cases/complete-order/complete-order.usecase';

describe('CompleteOrderUseCase', () => {
  let orderAppService: any;
  let eventPublisher: any;
  let useCase: CompleteOrderUseCase;

  beforeEach(() => {
    orderAppService = { completeOrder: vi.fn() };
    eventPublisher = { publish: vi.fn() };
    useCase = new CompleteOrderUseCase(orderAppService, eventPublisher);
  });

  it('應正確執行完成訂單用例', async () => {
    const fakeOrder = {
      getDomainEvents: () => [{ eventType: 'OrderCompleted' }],
      clearDomainEvents: vi.fn()
    };
    orderAppService.completeOrder.mockResolvedValue(fakeOrder);
    await useCase.execute('order-1');
    expect(orderAppService.completeOrder).toHaveBeenCalledWith('order-1');
    expect(eventPublisher.publish).toHaveBeenCalledWith({ eventType: 'OrderCompleted' });
    expect(fakeOrder.clearDomainEvents).toHaveBeenCalled();
  });
});
