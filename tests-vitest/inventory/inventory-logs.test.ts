import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GetInventoryLogsUseCase } from '../../src/domains/inventory/application/use-cases/get-inventory-logs';
import { AdjustStockUseCase } from '../../src/domains/inventory/application/use-cases/adjust-stock';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
import { PrismaClient } from '@prisma/client';

const productId = 'logs-test-product';
const prisma = new PrismaClient();
const getInventoryLogsUseCase = new GetInventoryLogsUseCase(prisma);
const adjustStockUseCase = new AdjustStockUseCase(prisma);

describe('查詢商品庫存異動紀錄 Use Case', () => {
  beforeAll(async () => {
    await cleanupTestProduct(productId);
    await setupTestProduct(productId);
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  it('應取得異動紀錄', async () => {
    // 先做一次調整，確保有紀錄
    await adjustStockUseCase.execute({ 
      productId, 
      quantity: 5, 
      reason: 'log-test', 
      operator: 'tester' 
    });

    const result = await getInventoryLogsUseCase.execute({ productId });
    
    expect(result.logs).toBeDefined();
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    
    const firstLog = result.logs[0];
    expect(firstLog).toHaveProperty('beforeQuantity');
    expect(firstLog).toHaveProperty('afterQuantity');
    expect(firstLog).toHaveProperty('delta');
    expect(firstLog).toHaveProperty('reason');
    expect(firstLog).toHaveProperty('operator');
    expect(firstLog).toHaveProperty('createdAt');
    expect(firstLog.reason).toBe('log-test');
    expect(firstLog.operator).toBe('tester');
  });
});
