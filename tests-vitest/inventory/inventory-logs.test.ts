import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getInventoryLogs, adjustProductStock } from '../../src/services/inventoryService';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
const productId = 'logs-test-product';

describe('查詢商品庫存異動紀錄 API', () => {
  beforeAll(async () => {
    await setupTestProduct(productId);
  });
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await disconnectPrisma();
  });

  it('應取得異動紀錄', async () => {
    // 先做一次調整，確保有紀錄
    await adjustProductStock({ productId, newStock: 5, reason: 'log-test', operator: 'tester' });
    const logs = await getInventoryLogs(productId);
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toHaveProperty('before');
    expect(logs[0]).toHaveProperty('after');
    expect(logs[0]).toHaveProperty('delta');
    expect(logs[0]).toHaveProperty('reason');
    expect(logs[0]).toHaveProperty('operator');
    expect(logs[0]).toHaveProperty('createdAt');
  });
});
