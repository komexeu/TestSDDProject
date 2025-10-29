import { getProductStock, adjustProductStock, saleProduct, getInventoryLogs } from '../../src/services/inventoryService';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';

const productId = 'unit-test-product';
describe('Inventory Service 單元測試', () => {
  jest.setTimeout(20000);
  beforeAll(async () => {
    await setupTestProduct(productId);
  });

  afterAll(async () => {
    await cleanupTestProduct(productId);
    await disconnectPrisma();
  });

  it('getProductStock 應取得正確庫存', async () => {
    const product = await getProductStock(productId);
    expect(product).toBeDefined();
    expect(product?.stock).toBeGreaterThanOrEqual(0);
  });

  it('adjustProductStock 應可調整庫存', async () => {
    const result = await adjustProductStock({ productId, newStock: 5, reason: 'unit', operator: 'tester' });
    expect(result).toMatchObject({ productId, stock: 5 });
    const product = await getProductStock(productId);
    expect(product?.stock).toBe(5);
  });

  it('saleProduct 應可扣庫存', async () => {
    await adjustProductStock({ productId, newStock: 10 });
    const result = await saleProduct({ productId, quantity: 2 });
    expect(result).toMatchObject({ productId, stock: 8 });
  });

  it('getInventoryLogs 應取得異動紀錄', async () => {
    const logs = await getInventoryLogs(productId);
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
  });

  it('adjustProductStock 負數應拋錯', async () => {
    await expect(adjustProductStock({ productId, newStock: -1 })).rejects.toThrow('庫存不可為負數');
  });

  it('saleProduct 庫存不足應拋錯', async () => {
    await adjustProductStock({ productId, newStock: 1 });
    await expect(saleProduct({ productId, quantity: 2 })).rejects.toThrow('庫存不足');
  });
});
