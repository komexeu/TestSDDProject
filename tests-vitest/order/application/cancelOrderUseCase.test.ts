import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelOrderUseCase } from '../../../src/domains/order/application/use-cases/cancel-order/cancel-order.usecase';

describe('CancelOrderUseCase', () => {
  let orderAppService: any;
  let eventPublisher: any;
  let useCase: CancelOrderUseCase;

  beforeEach(() => {
    orderAppService = { cancelOrder: vi.fn() };
    eventPublisher = { publish: vi.fn() };
    useCase = new CancelOrderUseCase(orderAppService, eventPublisher);
  });

  it('應正確執行取消訂單用例', async () => {
    const fakeOrder = {
      getDomainEvents: () => [{ eventType: 'OrderCancelled' }],
      clearDomainEvents: vi.fn()
    };
    orderAppService.cancelOrder.mockResolvedValue(fakeOrder);
    await useCase.execute('order-1', 'user');
    expect(orderAppService.cancelOrder).toHaveBeenCalledWith('order-1', 'user');
    expect(eventPublisher.publish).toHaveBeenCalledWith({ eventType: 'OrderCancelled' });
    expect(fakeOrder.clearDomainEvents).toHaveBeenCalled();
  });
});
