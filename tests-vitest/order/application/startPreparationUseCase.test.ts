import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StartPreparationUseCase } from '../../../src/domains/order/application/use-cases/start-preparation/start-preparation.usecase';

describe('StartPreparationUseCase', () => {
  let orderAppService: any;
  let eventPublisher: any;
  let useCase: StartPreparationUseCase;

  beforeEach(() => {
    orderAppService = { startPreparation: vi.fn() };
    eventPublisher = { publish: vi.fn() };
    useCase = new StartPreparationUseCase(orderAppService, eventPublisher);
  });

  it('應正確執行開始製作用例', async () => {
    const fakeOrder = {
      getDomainEvents: () => [{ eventType: 'OrderStartedPreparation' }],
      clearDomainEvents: vi.fn()
    };
    orderAppService.startPreparation.mockResolvedValue(fakeOrder);
    await useCase.execute('order-1');
    expect(orderAppService.startPreparation).toHaveBeenCalledWith('order-1');
    expect(eventPublisher.publish).toHaveBeenCalledWith({ eventType: 'OrderStartedPreparation' });
    expect(fakeOrder.clearDomainEvents).toHaveBeenCalled();
  });
});
