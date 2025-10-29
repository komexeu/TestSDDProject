import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
import { callback } from '../../src/index';

const productId = 'api-test-product';
describe('API 單元與整合測試', () => {
  const fetchApi = async (path: string, init?: RequestInit) => {
    const url = 'http://localhost' + path.replace('test-product-1', productId);
    return callback(new Request(url, init));
  };

  beforeAll(async () => {
    await setupTestProduct(productId);
  });

  afterAll(async () => {
    await cleanupTestProduct(productId);
    await disconnectPrisma();
  });

  it('查詢商品庫存', async () => {
    const res = await fetchApi(`/inventory/${productId}`, { method: 'GET' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('productId');
    expect(body).toHaveProperty('stock');
  });

  it('查詢異動紀錄', async () => {
    const res = await fetchApi(`/inventory/${productId}/logs`, { method: 'GET' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('手動調整庫存', async () => {
    const res = await fetchApi(`/inventory/${productId}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ newStock: 7, reason: 'api-test', operator: 'tester' }),
      headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('productId');
    expect(body).toHaveProperty('stock');
  });

  it('銷售自動扣庫存', async () => {
    const res = await fetchApi('/inventory/sale', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 }),
      headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('productId');
    expect(body).toHaveProperty('stock');
  });
});
