import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
import { callback } from '../../src/index';
import type { GetStockResponse, AdjustStockResponse, SaleStockResponse } from '../../src/domains/inventory/application/dto/inventory-dto';

const productId = 'api-test-product';
describe('API 單元與整合測試', () => {
  const fetchApi = async (path: string, init?: RequestInit) => {
    const url = 'http://localhost:3000' + path.replace('test-product-1', productId);
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
    const body: GetStockResponse = await res.json();
    expect(body.productId).toBe(productId);
    expect(typeof body.quantity).toBe('number');
  });

  it('查詢異動紀錄', async () => {
    const res = await fetchApi(`/inventory/${productId}/logs`, { method: 'GET' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('手動調整庫存', async () => {
    const res = await fetchApi(`/inventory/${productId}/adjust`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: 7, reason: 'api-test', operator: 'tester' }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
    });
    expect(res.status).toBe(200);
    const body: AdjustStockResponse = await res.json();
    expect(body.productId).toBe(productId);
    expect(typeof body.newQuantity).toBe('number');
  });

  it('銷售自動扣庫存', async () => {
    const res = await fetchApi(`/inventory/${productId}/sale`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
    });
    expect(res.status).toBe(200);
    const body: SaleStockResponse = await res.json();
    expect(body.productId).toBe(productId);
    expect(typeof body.remainingStock).toBe('number');
  });
});
