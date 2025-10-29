
import { getProductStock } from '../../src/services/inventoryService';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
const productId = 'stock-test-product';

describe('查詢商品庫存 API', () => {
  jest.setTimeout(20000);
  it('應回傳正確庫存', async () => {
    const product = await getProductStock(productId);
    expect(product).toBeDefined();
    expect(product).toHaveProperty('stock');
    expect(typeof product!.stock).toBe('number');
  });

  it('查無商品時應回傳 null', async () => {
    const product = await getProductStock('not-exist-id');
    expect(product).toBeNull();
  });
  beforeAll(async () => {
    await setupTestProduct(productId);
  });
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await disconnectPrisma();
  });
});
