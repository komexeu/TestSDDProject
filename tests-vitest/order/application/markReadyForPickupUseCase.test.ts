import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkReadyForPickupUseCase } from '../../../src/domains/order/application/use-cases/mark-ready-for-pickup/mark-ready-for-pickup.usecase';

describe('MarkReadyForPickupUseCase', () => {
  let orderAppService: any;
  let eventPublisher: any;
  let useCase: MarkReadyForPickupUseCase;

  beforeEach(() => {
    orderAppService = { markReadyForPickup: vi.fn() };
    eventPublisher = { publish: vi.fn() };
    useCase = new MarkReadyForPickupUseCase(orderAppService, eventPublisher);
  });

  it('應正確執行標記可取餐用例', async () => {
    const fakeOrder = {
      getDomainEvents: () => [{ eventType: 'OrderReadyForPickup' }],
      clearDomainEvents: vi.fn()
    };
    orderAppService.markReadyForPickup.mockResolvedValue(fakeOrder);
    await useCase.execute('order-1');
    expect(orderAppService.markReadyForPickup).toHaveBeenCalledWith('order-1');
    expect(eventPublisher.publish).toHaveBeenCalledWith({ eventType: 'OrderReadyForPickup' });
    expect(fakeOrder.clearDomainEvents).toHaveBeenCalled();
  });
});
