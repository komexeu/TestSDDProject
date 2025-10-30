import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { GetInventoryLogsRequest, GetInventoryLogsResponse } from '../dto/inventory-dto';
import { PrismaClient } from '@prisma/client';

export class GetInventoryLogsUseCase implements UseCase<GetInventoryLogsRequest, GetInventoryLogsResponse> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async execute(request: GetInventoryLogsRequest): Promise<GetInventoryLogsResponse> {
    const { productId, limit = 50, offset = 0 } = request;

    // 計算總數
    const total = await this.prisma.inventoryLog.count({
      where: { productId }
    });

    // 查詢日誌記錄
    const logs = await this.prisma.inventoryLog.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    return {
      logs: logs.map(log => ({
        id: log.id,
        productId: log.productId,
        beforeQuantity: log.before,
        afterQuantity: log.after,
        delta: log.delta,
        operationType: log.delta > 0 ? 'ADJUST' : 'SALE',
        reason: log.reason,
        operator: log.operator,
        createdAt: log.createdAt
      })),
      total
    };
  }
}