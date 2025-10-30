import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { AdjustStockRequest, AdjustStockResponse } from '../dto/inventory-dto';

// 臨時簡化版本，直接使用 Prisma
export class AdjustStockUseCase implements UseCase<AdjustStockRequest, AdjustStockResponse> {
  async execute(request: AdjustStockRequest): Promise<AdjustStockResponse> {
    // 這裡暫時返回模擬數據，實際應該使用領域模型
    return {
      productId: request.productId,
      previousQuantity: 10,
      newQuantity: request.quantity,
      delta: request.quantity - 10,
      reason: request.reason,
      operator: request.operator,
      updatedAt: new Date()
    };
  }
}