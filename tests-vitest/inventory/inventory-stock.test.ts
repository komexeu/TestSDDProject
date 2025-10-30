import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GetStockUseCase } from '../../src/domains/inventory/application/use-cases/get-stock';
import { setupTestProduct, cleanupTestProduct, disconnectPrisma } from './testUtils';
import { PrismaClient } from '@prisma/client';

const productId = 'stock-test-product';
const prisma = new PrismaClient();
const getStockUseCase = new GetStockUseCase(prisma);

describe('查詢商品庫存 Use Case', () => {
  beforeAll(async () => {
    await setupTestProduct(productId, 50);
  });
  afterAll(async () => {
    await cleanupTestProduct(productId);
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  it('應正確查詢商品庫存', async () => {
    const result = await getStockUseCase.execute({ productId });
    expect(result).toMatchObject({
      productId,
      quantity: 50
    });
    expect(result.updatedAt).toBeDefined();
  });

  it('查詢不存在的商品應拋出錯誤', async () => {
    await expect(
      getStockUseCase.execute({ productId: 'not-exist-id' })
    ).rejects.toThrow();
  });
});
