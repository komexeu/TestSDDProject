import 'reflect-metadata';
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
    // 基本鹹酥雞攤常見品項
    await prisma.product.upsert({
      where: { id: '1' },
      update: { name: '鹹酥雞', code: 'A', description: '經典鹹酥雞', price: 60, stock: 100 },
      create: { id: '1', name: '鹹酥雞', code: 'A', description: '經典鹹酥雞', price: 60, stock: 100 }
    });
    await prisma.product.upsert({
      where: { id: '2' },
      update: { name: '甜不辣', code: 'B', description: 'Q彈甜不辣', price: 40, stock: 80 },
      create: { id: '2', name: '甜不辣', code: 'B', description: 'Q彈甜不辣', price: 40, stock: 80 }
    });
    await prisma.product.upsert({
      where: { id: '3' },
      update: { name: '四季豆', code: 'C', description: '酥炸四季豆', price: 35, stock: 60 },
      create: { id: '3', name: '四季豆', code: 'C', description: '酥炸四季豆', price: 35, stock: 60 }
    });
    await prisma.product.upsert({
      where: { id: '4' },
      update: { name: '百頁豆腐', code: 'D', description: '外酥內嫩百頁豆腐', price: 30, stock: 70 },
      create: { id: '4', name: '百頁豆腐', code: 'D', description: '外酥內嫩百頁豆腐', price: 30, stock: 70 }
    });
    await prisma.product.upsert({
      where: { id: '5' },
      update: { name: '雞皮', code: 'E', description: '酥脆雞皮', price: 25, stock: 50 },
      create: { id: '5', name: '雞皮', code: 'E', description: '酥脆雞皮', price: 25, stock: 50 }
    });
    await prisma.product.upsert({
      where: { id: '6' },
      update: { name: '杏鮑菇', code: 'F', description: '多汁杏鮑菇', price: 40, stock: 40 },
      create: { id: '6', name: '杏鮑菇', code: 'F', description: '多汁杏鮑菇', price: 40, stock: 40 }
    });
    await prisma.product.upsert({
      where: { id: '7' },
      update: { name: '玉米筍', code: 'G', description: '鮮甜玉米筍', price: 35, stock: 30 },
      create: { id: '7', name: '玉米筍', code: 'G', description: '鮮甜玉米筍', price: 35, stock: 30 }
    });
    await prisma.product.upsert({
      where: { id: '8' },
      update: { name: '花枝丸', code: 'H', description: '彈牙花枝丸', price: 45, stock: 40 },
      create: { id: '8', name: '花枝丸', code: 'H', description: '彈牙花枝丸', price: 45, stock: 40 }
    });
    // ...可依需求再增加
    await prisma.$disconnect();
});