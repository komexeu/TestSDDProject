import { PrismaClient } from '@prisma/client';

// 單例資料庫連接
class DatabaseConnection {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });
    }
    return DatabaseConnection.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.$disconnect();
    }
  }
}

// 基礎倉儲介面
export interface Repository<T, TId> {
  findById(id: TId): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: TId): Promise<void>;
}

// 基礎倉儲實作
export abstract class BaseRepository<T, TId> implements Repository<T, TId> {
  protected readonly prisma: PrismaClient;

  constructor() {
    this.prisma = DatabaseConnection.getInstance();
  }

  abstract findById(id: TId): Promise<T | null>;
  abstract save(entity: T): Promise<void>;
  abstract delete(id: TId): Promise<void>;
}

export { DatabaseConnection };