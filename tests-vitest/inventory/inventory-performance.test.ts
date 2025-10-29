import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { saleProduct, adjustProductStock } from '../../src/services/inventoryService';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';

const productId = 'performance-test-product';

describe('API 效能壓力測試', () => {
  beforeAll(async () => {
    await setupTestProduct(productId);
    await adjustProductStock({ productId, newStock: 100 });
  });
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await disconnectPrisma();
  });

  it('高頻率銷售請求下效能不退化', async () => {
    const start = Date.now();
    const tasks = Array.from({ length: 50 }).map(() => saleProduct({ productId, quantity: 1 }));
    await Promise.allSettled(tasks);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000); // 2 秒內完成
  });
});
