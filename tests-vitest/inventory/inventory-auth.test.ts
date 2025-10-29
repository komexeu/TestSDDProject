import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { callback } from '../../src/index';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';

const productId = 'auth-test-product';
describe('API 權限控管測試', () => {
  const fetchApi = async (path: string, init?: RequestInit) => {
    const url = 'http://localhost' + path.replace('test-product-1', productId);
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
    await setupTestProduct(productId);
  });

  afterAll(async () => {
    await cleanupTestProduct(productId);
    await disconnectPrisma();
  });

  it('非管理員無法調整庫存', async () => {
    const res = await fetchApi(`/inventory/${productId}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ newStock: 1 }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.message).toMatch(/管理員/);
  });

  it('管理員可調整庫存', async () => {
    const res = await fetchApi(`/inventory/${productId}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ newStock: 2 }),
      headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
    });
    expect(res.status).toBe(200);
  });

  it('非管理員無法銷售', async () => {
    const res = await fetchApi('/inventory/sale', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(403);
  });

  it('管理員可銷售', async () => {
    const res = await fetchApi('/inventory/sale', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 }),
      headers: { 'Content-Type': 'application/json', 'x-role': 'admin' },
    });
    expect(res.status).toBe(200);
  });
});
