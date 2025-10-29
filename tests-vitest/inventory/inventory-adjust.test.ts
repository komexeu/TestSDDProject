import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { adjustProductStock, getProductStock } from '../../src/services/inventoryService';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';

const productId = 'adjust-test-product';

describe('手動調整商品庫存 API', () => {
  beforeAll(async () => {
    await setupTestProduct(productId);
  });
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await disconnectPrisma();
  });

  it('應正確調整庫存', async () => {
    const newStock = 10;
    const result = await adjustProductStock({ productId, newStock, reason: 'test', operator: 'tester' });
    expect(result).toMatchObject({ productId, stock: newStock });
    const product = await getProductStock(productId);
    expect(product?.stock).toBe(newStock);
  });

  it('庫存不可為負數', async () => {
    await expect(adjustProductStock({ productId, newStock: -1 })).rejects.toThrow('庫存不可為負數');
  });

  it('查無商品時應拋出錯誤', async () => {
    await expect(adjustProductStock({ productId: 'not-exist-id', newStock: 1 })).rejects.toThrow('查無商品');
  });
});
