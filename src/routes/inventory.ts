import { Hono } from 'hono';
import { getProductStock, getInventoryLogs, adjustProductStock, saleProduct } from '../services/inventoryService';
import { adminAuth } from '../middleware/auth';

const inventory = new Hono();

// 查詢單一商品庫存
inventory.get('/inventory/:productId', async (c) => {
  const { productId } = c.req.param();
  const product = await getProductStock(productId);
  if (!product) {
    return c.json({ message: '查無商品' }, 404);
  }
  return c.json({ productId: product.id, stock: product.stock });
});

// 查詢商品庫存異動紀錄
inventory.get('/inventory/:productId/logs', async (c) => {
  const { productId } = c.req.param();
  const logs = await getInventoryLogs(productId);
  return c.json(logs);
});

export default inventory;

// 手動調整商品庫存（僅管理員）
inventory.post('/inventory/:productId/adjust', adminAuth, async (c) => {
  const { productId } = c.req.param();
  const { newStock, reason, operator = 'admin' } = await c.req.json();
  try {
    const result = await adjustProductStock({ productId, newStock, reason, operator });
    return c.json(result);
  } catch (e: any) {
    return c.json({ message: e.message }, 400);
  }
});

// 銷售自動扣庫存（高併發防超賣，僅管理員）
inventory.post('/inventory/sale', adminAuth, async (c) => {
  const { productId, quantity, operator = 'system' } = await c.req.json();
  try {
    const result = await saleProduct({ productId, quantity, operator });
    return c.json(result);
  } catch (e: any) {
    const msg = e.message || '操作失敗';
    return c.json({ message: msg }, msg === '查無商品' ? 404 : 400);
  }
});
