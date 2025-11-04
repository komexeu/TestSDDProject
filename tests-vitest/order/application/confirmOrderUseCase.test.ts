import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfirmOrderUseCase } from '../../../src/domains/order/application/use-cases/confirm-order/confirm-order.usecase';

describe('ConfirmOrderUseCase', () => {
  let orderAppService: any;
  let eventPublisher: any;
  let useCase: ConfirmOrderUseCase;

  beforeEach(() => {
    orderAppService = { confirmOrder: vi.fn() };
    eventPublisher = { publish: vi.fn() };
    useCase = new ConfirmOrderUseCase(orderAppService, eventPublisher);
  });

  it('應正確執行確認訂單用例', async () => {
    const fakeOrder = {
      getDomainEvents: () => [{ eventType: 'OrderConfirmed' }],
      clearDomainEvents: vi.fn()
    };
    orderAppService.confirmOrder.mockResolvedValue(fakeOrder);
    await useCase.execute('order-1');
    expect(orderAppService.confirmOrder).toHaveBeenCalledWith('order-1');
    expect(eventPublisher.publish).toHaveBeenCalledWith({ eventType: 'OrderConfirmed' });
    expect(fakeOrder.clearDomainEvents).toHaveBeenCalled();
  });
});
