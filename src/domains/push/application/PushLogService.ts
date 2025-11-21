// 推播記錄儲存與查詢 service
import { PushLog } from '../domain/entities/PushLog';

export interface IPushLogService {
  /**
   * 新增推播記錄
   */
  create(log: Omit<PushLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<PushLog>;

  /**
   * 查詢用戶推播記錄
   */
  findByUser(userId: string): Promise<PushLog[]>;

  /**
   * 查詢訂單推播記錄
   */
  findByOrder(orderId: string): Promise<PushLog[]>;
}

// 實作骨架（細節待實作）
export class PushLogService implements IPushLogService {
  async create(log: Omit<PushLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<PushLog> {
    // TODO: Prisma 實作
    throw new Error('Not implemented');
  }
  async findByUser(userId: string): Promise<PushLog[]> {
    // TODO: Prisma 實作
    throw new Error('Not implemented');
  }
  async findByOrder(orderId: string): Promise<PushLog[]> {
    // TODO: Prisma 實作
    throw new Error('Not implemented');
  }
}
