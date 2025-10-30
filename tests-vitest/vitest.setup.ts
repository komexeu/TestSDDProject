import { beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

beforeAll(async () => {
  // 插入預設測試資料
  const prisma = new PrismaClient();
    // 僅插入預設測試資料，不再 reset/migrate，避免 race condition
    // 預設管理員 upsert
    await prisma.admin.upsert({
      where: { id: 'admin-1' },
      update: { name: '管理員' },
      create: { id: 'admin-1', name: '管理員' }
    });
    // 預設商品 upsert
    await prisma.product.upsert({
      where: { id: '1' },
      update: { name: '測試商品A-1', code: 'A', description: '自動產生的測試商品', price: 100, stock: 50 },
      create: { id: '1', name: '測試商品A-1', code: 'A', description: '自動產生的測試商品', price: 100, stock: 50 }
    });
    await prisma.product.upsert({
      where: { id: '2' },
      update: { name: '測試商品A-2', code: 'A', description: '自動產生的測試商品', price: 200, stock: 30 },
      create: { id: '2', name: '測試商品A-2', code: 'A', description: '自動產生的測試商品', price: 200, stock: 30 }
    });
    await prisma.$disconnect();
});