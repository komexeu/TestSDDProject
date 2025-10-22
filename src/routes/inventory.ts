import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { adminAuth } from '../middleware/auth';

const prisma = new PrismaClient();
const inventory = new Hono();

// 查詢單一商品庫存
inventory.get('/inventory/:productId', async (c) => {
  const { productId } = c.req.param();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true },
  });
  if (!product) {
    return c.json({ message: '查無商品' }, 404);
  }
  return c.json({ productId: product.id, stock: product.stock });
});

// 查詢商品庫存異動紀錄
inventory.get('/inventory/:productId/logs', async (c) => {
  const { productId } = c.req.param();
  const logs = await prisma.inventoryLog.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    select: {
      before: true,
      after: true,
      delta: true,
      reason: true,
      operator: true,
      createdAt: true,
    },
  });
  return c.json(logs);
});

export default inventory;

// 手動調整商品庫存（僅管理員）
inventory.post('/inventory/:productId/adjust', adminAuth, async (c) => {
  const { productId } = c.req.param();
  const { newStock, reason, operator = 'admin' } = await c.req.json();
  if (typeof newStock !== 'number' || newStock < 0) {
    return c.json({ message: '庫存不可為負數' }, 400);
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return c.json({ message: '查無商品' }, 404);
  }
  const before = product.stock;
  await prisma.product.update({ where: { id: productId }, data: { stock: newStock } });
  await prisma.inventoryLog.create({
    data: {
      productId,
      before,
      after: newStock,
      delta: newStock - before,
      reason: reason || '手動調整',
      operator,
    },
  });
  return c.json({ productId, stock: newStock });
});

// 銷售自動扣庫存（高併發防超賣，僅管理員）
inventory.post('/inventory/sale', adminAuth, async (c) => {
  const { productId, quantity, operator = 'system' } = await c.req.json();
  if (!productId || typeof quantity !== 'number' || quantity <= 0) {
    return c.json({ message: '參數錯誤' }, 400);
  }
  // 原子遞減，防止超賣
  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) return { error: '查無商品' };
    if (product.stock < quantity) return { error: '庫存不足' };
    const before = product.stock;
    const updated = await tx.product.update({
      where: { id: productId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    if (!updated) return { error: '庫存不足' };
    await tx.inventoryLog.create({
      data: {
        productId,
        before,
        after: before - quantity,
        delta: -quantity,
        reason: '銷售',
        operator,
      },
    });
    return { productId, stock: before - quantity };
  });
  if (result.error) {
    return c.json({ message: result.error }, result.error === '查無商品' ? 404 : 400);
  }
  return c.json(result);
});
