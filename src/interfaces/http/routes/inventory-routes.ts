import { Hono } from 'hono';
import { InventoryController } from '../controllers/inventory-controller';
import { adminAuth } from '../middleware/common';

export function createInventoryRoutes(inventoryController: InventoryController): Hono {
  const app = new Hono();

  // 查詢庫存（需要管理員權限）
  app.use('*', adminAuth);
  
  app.get('/inventory/:productId', (c) => inventoryController.getStock(c));
  app.put('/inventory/:productId/adjust', (c) => inventoryController.adjustStock(c));
  app.post('/inventory/:productId/sale', (c) => inventoryController.saleStock(c));
  app.get('/inventory/:productId/logs', (c) => inventoryController.getInventoryLogs(c));

  return app;
}