import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 查詢商品庫存
 */
export async function getProductStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true },
  });
  return product;
}

/**
 * 查詢商品庫存異動紀錄
 */
export async function getInventoryLogs(productId: string) {
  return prisma.inventoryLog.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * 手動調整商品庫存（不可為負數，異動必寫入 InventoryLog）
 */
export async function adjustProductStock({
  productId,
  newStock,
  reason = '手動調整',
  operator = 'admin',
}: {
  productId: string;
  newStock: number;
  reason?: string;
  operator?: string;
}) {
  if (typeof newStock !== 'number' || newStock < 0) {
    throw new Error('庫存不可為負數');
  }
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('查無商品');
  const before = product.stock;
  await prisma.product.update({ where: { id: productId }, data: { stock: newStock } });
  await prisma.inventoryLog.create({
    data: {
      productId,
      before,
      after: newStock,
      delta: newStock - before,
      reason,
      operator,
    },
  });
  return { productId, stock: newStock };
}

/**
 * 銷售自動扣庫存（高併發防超賣，異動必寫入 InventoryLog）
 */
export async function saleProduct({
  productId,
  quantity,
  operator = 'system',
}: {
  productId: string;
  quantity: number;
  operator?: string;
}) {
  if (!productId || typeof quantity !== 'number' || quantity <= 0) {
    throw new Error('參數錯誤');
  }
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('查無商品');
    if (product.stock < quantity) throw new Error('庫存不足');
    const before = product.stock;
    const updated = await tx.product.update({
      where: { id: productId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    if (!updated) throw new Error('庫存不足');
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
}
