import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { GetStockRequest, GetStockResponse } from '../dto/inventory-dto';
import { NotFoundError } from '../../../../shared/application/exceptions';

// 臨時簡化版本
export class GetStockUseCase implements UseCase<GetStockRequest, GetStockResponse> {
  async execute(request: GetStockRequest): Promise<GetStockResponse> {
    // 模擬庫存數據
    return {
      productId: request.productId,
      quantity: 20,
      updatedAt: new Date()
    };
  }
}