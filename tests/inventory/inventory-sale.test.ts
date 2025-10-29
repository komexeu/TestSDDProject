import { saleProduct, getProductStock } from '../../src/services/inventoryService';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';

const productId = 'sale-test-product';

describe('銷售自動扣庫存 API', () => {
  jest.setTimeout(20000);
  beforeAll(async () => {
    await setupTestProduct(productId);
  });
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await disconnectPrisma();
  });

  it('應正確扣除庫存', async () => {
    // setupTestProduct 已建立商品並設好庫存 10
    const before = (await getProductStock(productId))?.stock ?? 0;
    const result = await saleProduct({ productId, quantity: 2 });
    expect(result).toMatchObject({ productId, stock: before - 2 });
  });

  it('庫存不足時應拋出錯誤', async () => {
    await expect(saleProduct({ productId, quantity: 9999 })).rejects.toThrow('庫存不足');
  });

  it('查無商品時應拋出錯誤', async () => {
    await expect(saleProduct({ productId: 'not-exist-id', quantity: 1 })).rejects.toThrow('查無商品');
  });
});
