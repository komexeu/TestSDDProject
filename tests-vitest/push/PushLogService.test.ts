import { describe, it, expect } from 'vitest';
import { PushLogService } from '@domains/push/application/PushLogService';

describe('PushLogService', () => {
  const service = new PushLogService();

  it('should throw not implemented for create', async () => {
    await expect(service.create({
      userId: 'user1',
      orderId: 'order1',
      channel: 'LINE',
      message: 'msg',
      status: 'SUCCESS',
      retryCount: 0,
    })).rejects.toThrow('Not implemented');
  });

  it('should throw not implemented for findByUser', async () => {
    await expect(service.findByUser('user1')).rejects.toThrow('Not implemented');
  });

  it('should throw not implemented for findByOrder', async () => {
    await expect(service.findByOrder('order1')).rejects.toThrow('Not implemented');
  });
});
