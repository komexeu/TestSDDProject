import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SaleStockUseCase } from '../../src/domains/inventory/application/use-cases/sale-stock';
import { GetStockUseCase } from '../../src/domains/inventory/application/use-cases/get-stock';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
import { PrismaClient } from '@prisma/client';

const productId = 'sale-test-product';
const prisma = new PrismaClient();
const saleStockUseCase = new SaleStockUseCase(prisma);
const getStockUseCase = new GetStockUseCase(prisma);

describe('銷售自動扣庫存 Use Case', () => {
  beforeAll(async () => {
    await setupTestProduct(productId);
  });
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  it('應正確扣除庫存', async () => {
    // setupTestProduct 已建立商品並設好庫存 100
    const beforeProduct = await getStockUseCase.execute({ productId });
    const result = await saleStockUseCase.execute({ productId, quantity: 2, operator: '測試員' });
    
    expect(result).toMatchObject({ 
      productId, 
      remainingStock: beforeProduct.quantity - 2,
      soldQuantity: 2
    });
  });

  it('庫存不足時應拋出錯誤', async () => {
    await expect(
      saleStockUseCase.execute({ 
        productId, 
        quantity: 9999, 
        operator: '測試員' 
      })
    ).rejects.toThrow('庫存不足');
  });

  it('查無商品時應拋出錯誤', async () => {
    await expect(
      saleStockUseCase.execute({ 
        productId: 'not-exist-id', 
        quantity: 1, 
        operator: '測試員' 
      })
    ).rejects.toThrow('查無商品');
  });
});
