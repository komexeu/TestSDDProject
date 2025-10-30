import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SaleStockUseCase } from '../../src/domains/inventory/application/use-cases/sale-stock';
import { AdjustStockUseCase } from '../../src/domains/inventory/application/use-cases/adjust-stock';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
import { PrismaClient } from '@prisma/client';

const productId = 'performance-test-product';
const prisma = new PrismaClient();
const saleStockUseCase = new SaleStockUseCase(prisma);
const adjustStockUseCase = new AdjustStockUseCase(prisma);

describe('Use Case 效能壓力測試', () => {
  beforeAll(async () => {
    await setupTestProduct(productId);
    await adjustStockUseCase.execute({ 
      productId, 
      quantity: 100, 
      reason: 'prepare for performance test', 
      operator: 'tester' 
    });
  });
  
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  it('高頻率銷售請求下效能不退化', async () => {
    const start = Date.now();
    const tasks = Array.from({ length: 50 }).map(() => 
      saleStockUseCase.execute({ 
        productId, 
        quantity: 1, 
        operator: 'performance-tester' 
      })
    );
    
    await Promise.allSettled(tasks);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(2000); // 2 秒內完成
  });
});
