// Inventory test utilities
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupTestProduct(
  productId: string,
  initialStock = 100,
  isActive: boolean = true,
  createdAt?: Date,
  updatedAt?: Date
) {
  return await prisma.product.create({
    data: {
      id: productId,
      name: `Test Product ${productId}`,
      code: productId,
      description: `Test product description for ${productId}`,
      price: 1000,
      stock: initialStock,
      isActive,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    },
  });
}

export async function cleanupTestProduct(productId: string) {
  // 先刪除相關的 inventory logs
  await prisma.inventoryLog.deleteMany({
    where: { productId },
  });
  // 再刪除 product
  await prisma.product.deleteMany({
    where: { id: productId },
  });
}

export async function cleanupTestData() {
  await prisma.inventoryLog.deleteMany();
  await prisma.product.deleteMany();
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

export async function createTestProduct(
  productName: string,
  productCode?: string,
  initialStock = 100,
  isActive: boolean = true,
  createdAt?: Date,
  updatedAt?: Date
) {
  return await prisma.product.create({
    data: {
      name: productName,
      code: productCode,
      description: `Test product description for ${productName}`,
      price: 1000,
      stock: initialStock,
      isActive,
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    },
  });
}

export async function getProductStock(productName: string) {
  const product = await prisma.product.findUnique({
    where: { name: productName },
  });
  return product?.stock ?? null;
}

export async function getProductByCode(productCode: string) {
  const product = await prisma.product.findFirst({
    where: { code: productCode },
  });
  return product;
}

export { prisma };