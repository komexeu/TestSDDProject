import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { GetInventoryLogsRequest, GetInventoryLogsResponse } from '../dto/inventory-dto';

// 臨時簡化版本
export class GetInventoryLogsUseCase implements UseCase<GetInventoryLogsRequest, GetInventoryLogsResponse> {
  async execute(request: GetInventoryLogsRequest): Promise<GetInventoryLogsResponse> {
    return {
      logs: [],
      total: 0
    };
  }
}