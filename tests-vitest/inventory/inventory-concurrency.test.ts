import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SaleStockUseCase } from '../../src/domains/inventory/application/use-cases/sale-stock';
import { AdjustStockUseCase } from '../../src/domains/inventory/application/use-cases/adjust-stock';
import { GetStockUseCase } from '../../src/domains/inventory/application/use-cases/get-stock';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
import { PrismaClient } from '@prisma/client';

const productId = 'concurrency-test-product';
const prisma = new PrismaClient();
const saleStockUseCase = new SaleStockUseCase(prisma);
const adjustStockUseCase = new AdjustStockUseCase(prisma);
const getStockUseCase = new GetStockUseCase(prisma);

describe('高併發防超賣測試', () => {
  beforeAll(async () => {
    await setupTestProduct(productId);
    await adjustStockUseCase.execute({ 
      productId, 
      quantity: 5, 
      reason: 'prepare for concurrency test', 
      operator: 'tester' 
    });
  });
  
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  it('多併發下不會超賣', async () => {
    const tasks = Array.from({ length: 10 }).map(() => 
      saleStockUseCase.execute({ 
        productId, 
        quantity: 1, 
        operator: 'concurrency-tester' 
      })
    );
    
    const results = await Promise.allSettled(tasks);
    const success = results.filter(r => r.status === 'fulfilled');
    const fail = results.filter(r => r.status === 'rejected');
    
    const finalStockResult = await getStockUseCase.execute({ productId });
    
    expect(success.length).toBe(5);
    expect(fail.length).toBe(5);
    expect(finalStockResult.quantity).toBe(0);
  });
});
