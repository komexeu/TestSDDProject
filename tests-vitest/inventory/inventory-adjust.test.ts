import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AdjustStockUseCase } from '../../src/domains/inventory/application/use-cases/adjust-stock';
import { GetStockUseCase } from '../../src/domains/inventory/application/use-cases/get-stock';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
import { PrismaClient } from '@prisma/client';

const productId = 'adjust-test-product';
const prisma = new PrismaClient();
const adjustStockUseCase = new AdjustStockUseCase(prisma);
const getStockUseCase = new GetStockUseCase(prisma);

describe('手動調整商品庫存 Use Case', () => {
  beforeAll(async () => {
    await setupTestProduct(productId);
  });
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  it('應正確調整庫存', async () => {
    const newStock = 10;
    const result = await adjustStockUseCase.execute({ 
      productId, 
      quantity: newStock, 
      reason: '測試調整', 
      operator: '測試員' 
    });
    
    expect(result).toMatchObject({ 
      productId, 
      newQuantity: newStock 
    });
    
    const product = await getStockUseCase.execute({ productId });
    expect(product.quantity).toBe(newStock);
  });

  it('庫存不可為負數', async () => {
    await expect(
      adjustStockUseCase.execute({ 
        productId, 
        quantity: -1, 
        reason: '測試負數', 
        operator: '測試員' 
      })
    ).rejects.toThrow('庫存不可為負數');
  });

  it('查無商品時應拋出錯誤', async () => {
    await expect(
      adjustStockUseCase.execute({ 
        productId: 'not-exist-id', 
        quantity: 1, 
        reason: '測試不存在商品', 
        operator: '測試員' 
      })
    ).rejects.toThrow('查無商品');
  });
});
