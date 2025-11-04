import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FailOrderUseCase } from '../../../src/domains/order/application/use-cases/fail-order/fail-order.usecase';

describe('FailOrderUseCase', () => {
  let orderAppService: any;
  let eventPublisher: any;
  let useCase: FailOrderUseCase;

  beforeEach(() => {
    orderAppService = { failOrder: vi.fn() };
    eventPublisher = { publish: vi.fn() };
    useCase = new FailOrderUseCase(orderAppService, eventPublisher);
  });

  it('應正確執行標記失敗用例', async () => {
    const fakeOrder = {
      getDomainEvents: () => [{ eventType: 'OrderFailed' }],
      clearDomainEvents: vi.fn()
    };
    orderAppService.failOrder.mockResolvedValue(fakeOrder);
    await useCase.execute('order-1', '測試失敗');
    expect(orderAppService.failOrder).toHaveBeenCalledWith('order-1', '測試失敗');
    expect(eventPublisher.publish).toHaveBeenCalledWith({ eventType: 'OrderFailed' });
    expect(fakeOrder.clearDomainEvents).toHaveBeenCalled();
  });
});
