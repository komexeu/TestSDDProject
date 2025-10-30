import { Inventory, InventoryId, ProductId, InventoryLog, InventoryLogId } from '../entities/inventory';

// 庫存倉儲介面
export interface InventoryRepository {
  findById(id: InventoryId): Promise<Inventory | null>;
  findByProductId(productId: ProductId): Promise<Inventory | null>;
  save(inventory: Inventory): Promise<void>;
  delete(id: InventoryId): Promise<void>;
}

// 庫存日誌倉儲介面
export interface InventoryLogRepository {
  findById(id: InventoryLogId): Promise<InventoryLog | null>;
  findByProductId(productId: ProductId, limit?: number, offset?: number): Promise<InventoryLog[]>;
  save(log: InventoryLog): Promise<void>;
  countByProductId(productId: ProductId): Promise<number>;
}