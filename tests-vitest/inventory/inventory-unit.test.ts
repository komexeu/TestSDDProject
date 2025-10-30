import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GetStockUseCase } from '../../src/domains/inventory/application/use-cases/get-stock';
import { AdjustStockUseCase } from '../../src/domains/inventory/application/use-cases/adjust-stock';
import { SaleStockUseCase } from '../../src/domains/inventory/application/use-cases/sale-stock';
import { GetInventoryLogsUseCase } from '../../src/domains/inventory/application/use-cases/get-inventory-logs';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
import { PrismaClient } from '@prisma/client';

const productId = 'unit-test-product';
const prisma = new PrismaClient();
const getStockUseCase = new GetStockUseCase(prisma);
const adjustStockUseCase = new AdjustStockUseCase(prisma);
const saleStockUseCase = new SaleStockUseCase(prisma);
const getInventoryLogsUseCase = new GetInventoryLogsUseCase(prisma);

describe('Inventory Use Cases 單元測試', () => {
  beforeAll(async () => {
    await setupTestProduct(productId);
  });

  afterAll(async () => {
    await cleanupTestProduct(productId);
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  it('GetStockUseCase 應取得正確庫存', async () => {
    const result = await getStockUseCase.execute({ productId });
    expect(result).toBeDefined();
    expect(result.quantity).toBeGreaterThanOrEqual(0);
    expect(result.productId).toBe(productId);
  });

  it('AdjustStockUseCase 應可調整庫存', async () => {
    const result = await adjustStockUseCase.execute({ 
      productId, 
      quantity: 5, 
      reason: 'unit test', 
      operator: 'tester' 
    });
    
    expect(result).toMatchObject({ 
      productId, 
      newQuantity: 5 
    });
    
    const stockResult = await getStockUseCase.execute({ productId });
    expect(stockResult.quantity).toBe(5);
  });

  it('SaleStockUseCase 應可扣庫存', async () => {
    await adjustStockUseCase.execute({ 
      productId, 
      quantity: 10, 
      reason: 'prepare for sale', 
      operator: 'tester' 
    });
    
    const result = await saleStockUseCase.execute({ 
      productId, 
      quantity: 2, 
      operator: 'tester' 
    });
    
    expect(result).toMatchObject({ 
      productId, 
      remainingStock: 8,
      soldQuantity: 2
    });
  });

  it('GetInventoryLogsUseCase 應取得異動紀錄', async () => {
    const result = await getInventoryLogsUseCase.execute({ productId });
    expect(result.logs).toBeDefined();
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it('AdjustStockUseCase 負數應拋錯', async () => {
    await expect(
      adjustStockUseCase.execute({ 
        productId, 
        quantity: -1, 
        reason: 'test negative', 
        operator: 'tester' 
      })
    ).rejects.toThrow('庫存不可為負數');
  });

  it('SaleStockUseCase 庫存不足應拋錯', async () => {
    await adjustStockUseCase.execute({ 
      productId, 
      quantity: 1, 
      reason: 'set low stock', 
      operator: 'tester' 
    });
    
    await expect(
      saleStockUseCase.execute({ 
        productId, 
        quantity: 2, 
        operator: 'tester' 
      })
    ).rejects.toThrow('庫存不足');
  });
});
