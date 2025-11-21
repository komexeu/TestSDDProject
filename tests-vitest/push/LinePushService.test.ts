import { describe, it, expect } from 'vitest';
import { LinePushService } from '@domains/push/application/LinePushService';

describe('LinePushService', () => {
  const service = new LinePushService();

  it('should return not implemented', async () => {
    const result = await service.pushOrderStatus('user1', 'order1', 'msg');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not implemented');
  });

  // TODO: add tests for success, failure, retry, error cases
});
