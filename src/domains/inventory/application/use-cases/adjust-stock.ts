import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { AdjustStockRequest, AdjustStockResponse } from '../dto/inventory-dto';
import { PrismaClient } from '@prisma/client';

export class AdjustStockUseCase implements UseCase<AdjustStockRequest, AdjustStockResponse> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async execute(request: AdjustStockRequest): Promise<AdjustStockResponse> {
    const { productId, quantity, reason, operator } = request;

    // 驗證庫存不可為負數
    if (quantity < 0) {
      throw new Error('庫存不可為負數');
    }

    // 檢查商品是否存在
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('查無商品');
    }

    const previousQuantity = product.stock;

    // 更新庫存
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: { stock: quantity }
    });

    // 記錄庫存變動日誌
    await this.prisma.inventoryLog.create({
      data: {
        productId,
        before: previousQuantity,
        after: quantity,
        delta: quantity - previousQuantity,
        operator,
        reason
      }
    });

    const response: AdjustStockResponse = {
      productId: updatedProduct.id,
      previousQuantity: previousQuantity,
      newQuantity: updatedProduct.stock,
      delta: quantity - previousQuantity,
      reason: reason,
      operator: operator,
      updatedAt: new Date()
    };
    return response;
  }
}