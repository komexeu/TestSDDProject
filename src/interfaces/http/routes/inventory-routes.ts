import { Hono } from 'hono';
import { InventoryController } from '../controllers/inventory-controller';
import { adminAuth } from '../middleware/common';

export function createInventoryRoutes(inventoryController: InventoryController): Hono {
  const app = new Hono();

  // 查詢庫存、異動紀錄（不需管理員）
  app.get('/inventory/:productId', (c) => inventoryController.getStock(c));
  app.get('/inventory/:productId/logs', (c) => inventoryController.getInventoryLogs(c));

  // 需要管理員權限
  app.put('/inventory/:productId/adjust', adminAuth, (c) => inventoryController.adjustStock(c));
  app.post('/inventory/:productId/sale', adminAuth, (c) => inventoryController.saleStock(c));

  return app;
}