import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { SaleStockRequest, SaleStockResponse } from '../dto/inventory-dto';
import { PrismaClient } from '@prisma/client';

export class SaleStockUseCase implements UseCase<SaleStockRequest, SaleStockResponse> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async execute(request: SaleStockRequest): Promise<SaleStockResponse> {
    const { productId, quantity, operator = 'system' } = request;

    // 使用事務和悲觀鎖確保併發安全
    const result = await this.prisma.$transaction(async (tx) => {
      // 使用 SELECT FOR UPDATE 進行悲觀鎖定
      const product = await tx.$queryRaw<Array<{id: string, stock: number}>>`
        SELECT id, stock FROM "Product" WHERE id = ${productId} FOR UPDATE
      `;

      if (!product || product.length === 0) {
        throw new Error('查無商品');
      }

      const currentStock = product[0].stock;

      // 檢查庫存是否足夠
      if (currentStock < quantity) {
        throw new Error('庫存不足');
      }

      const newStock = currentStock - quantity;

      // 更新庫存
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock }
      });

      // 記錄庫存變動日誌
      await tx.inventoryLog.create({
        data: {
          productId,
          before: currentStock,
          after: newStock,
          delta: -quantity,
          operator,
          reason: '商品銷售'
        }
      });

      return updatedProduct;
    });

    return {
      productId: result.id,
      remainingStock: result.stock,
      soldQuantity: quantity,
      operator,
      timestamp: new Date()
    };
  }
}