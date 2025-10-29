import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupTestProduct(productId: string = 'test-product-1') {
  await prisma.product.upsert({
    where: { id: productId },
    update: { name: `測試商品-${productId}`, description: 'for test', price: 100, stock: 10 },
    create: {
      id: productId,
      name: `測試商品-${productId}`,
      description: 'for test',
      price: 100,
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function cleanupTestProduct(productId: string = 'test-product-1') {
  await prisma.inventoryLog.deleteMany({ where: { productId } });
  await prisma.product.deleteMany({ where: { id: productId } });
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}