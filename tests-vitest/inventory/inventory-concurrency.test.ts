import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { saleProduct, adjustProductStock, getProductStock } from '../../src/services/inventoryService';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';

const productId = 'concurrency-test-product';

describe('高併發防超賣測試', () => {
  beforeAll(async () => {
    await setupTestProduct(productId);
    await adjustProductStock({ productId, newStock: 5 });
  });
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await disconnectPrisma();
  });

  it('多併發下不會超賣', async () => {
    const tasks = Array.from({ length: 10 }).map(() => saleProduct({ productId, quantity: 1 }));
    const results = await Promise.allSettled(tasks);
    const success = results.filter(r => r.status === 'fulfilled');
    const fail = results.filter(r => r.status === 'rejected');
    const finalStock = (await getProductStock(productId))?.stock;
    expect(success.length).toBe(5);
    expect(fail.length).toBe(5);
    expect(finalStock).toBe(0);
  });
});
