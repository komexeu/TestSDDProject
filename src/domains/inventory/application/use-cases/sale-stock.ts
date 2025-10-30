import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { SaleStockRequest, SaleStockResponse } from '../dto/inventory-dto';

// 臨時簡化版本
export class SaleStockUseCase implements UseCase<SaleStockRequest, SaleStockResponse> {
  async execute(request: SaleStockRequest): Promise<SaleStockResponse> {
    return {
      productId: request.productId,
      remainingStock: 15,
      soldQuantity: request.quantity,
      operator: request.operator || 'system',
      timestamp: new Date()
    };
  }
}