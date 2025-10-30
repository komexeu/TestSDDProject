import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { callback } from '../../src/index';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';

const productId = 'auth-test-product';
describe('API 權限控管測試', () => {
  const fetchApi = async (path: string, init?: RequestInit) => {
    const url = 'http://localhost:3000' + path.replace('test-product-1', productId);
    if (init?.body) {
      try {
        const bodyObj = JSON.parse(init.body as string);
        if (bodyObj.productId === 'test-product-1') bodyObj.productId = productId;
        init.body = JSON.stringify(bodyObj);
      } catch {}
    }
    return callback(new Request(url, init));
  };

  beforeAll(async () => {
    await cleanupTestProduct(productId);
    await setupTestProduct(productId);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it('非管理員無法調整庫存', async () => {
    // 未帶 token，應回傳 401
    const res1 = await fetchApi(`/inventory/${productId}/adjust`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: 1, reason: 'test', operator: 'user' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res1.status).toBe(401);
    // 帶錯誤 token，應回傳 403
    const res2 = await fetchApi(`/inventory/${productId}/adjust`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: 1, reason: 'test', operator: 'user' }),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer not-admin-token' },
    });
    expect(res2.status).toBe(403);
  // 不驗證 message 欄位，僅驗證 403 狀態
  });

  it('管理員可調整庫存', async () => {
      const res = await fetchApi(`/inventory/${productId}/adjust`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: 2, reason: 'test', operator: 'admin' }),
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
      });
    expect(res.status).toBe(200);
  });

  it('非管理員無法銷售', async () => {
      // 未帶 token，應回傳 401
      const res1 = await fetchApi(`/inventory/${productId}/sale`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(res1.status).toBe(401);
      // 帶錯誤 token，應回傳 403
      const res2 = await fetchApi(`/inventory/${productId}/sale`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer not-admin-token' },
      });
      expect(res2.status).toBe(403);
  });

  it('管理員可銷售', async () => {
      const res = await fetchApi(`/inventory/${productId}/sale`, {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 }),
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
      });
    expect(res.status).toBe(200);
  });
});
