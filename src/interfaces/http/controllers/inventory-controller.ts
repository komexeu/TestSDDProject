import { Context } from 'hono';
import { ValidationError } from '../../../shared/application/exceptions';

// 臨時簡化的庫存控制器
export class InventoryController {
  constructor() {}

  // 查詢庫存
  async getStock(c: Context) {
    const productId = c.req.param('productId');
    
    // 模擬回應
    const result = {
      productId: productId,
      quantity: 20,
      updatedAt: new Date()
    };

    return c.json(result);
  }

  // 調整庫存
  async adjustStock(c: Context) {
    const productId = c.req.param('productId');
    const data = await c.req.json();
    
    if (typeof data.quantity !== 'number' || !Number.isInteger(data.quantity)) {
      throw new ValidationError('數量必須為整數', 'quantity');
    }
    if (!data.reason || typeof data.reason !== 'string') {
      throw new ValidationError('必須提供調整原因', 'reason');
    }
    if (!data.operator || typeof data.operator !== 'string') {
      throw new ValidationError('必須提供操作者', 'operator');
    }

    // 模擬回應
    const result = {
      productId: productId,
      previousQuantity: 10,
      newQuantity: data.quantity,
      delta: data.quantity - 10,
      reason: data.reason,
      operator: data.operator,
      updatedAt: new Date()
    };

    return c.json(result);
  }

  // 銷售扣庫存
  async saleStock(c: Context) {
    const productId = c.req.param('productId');
    const data = await c.req.json();
    
    if (typeof data.quantity !== 'number' || !Number.isInteger(data.quantity) || data.quantity <= 0) {
      throw new ValidationError('銷售數量必須為正整數', 'quantity');
    }

    // 模擬回應
    const result = {
      productId: productId,
      remainingStock: 15,
      soldQuantity: data.quantity,
      operator: data.operator || 'system',
      timestamp: new Date()
    };

    return c.json(result);
  }

  // 查詢庫存日誌
  async getInventoryLogs(c: Context) {
    const productId = c.req.param('productId');
    const query = c.req.query();
    
    // 模擬回應
    const result = {
      logs: [
        {
          id: '1',
          productId: productId,
          beforeQuantity: 10,
          afterQuantity: 15,
          delta: 5,
          operationType: '補貨',
          reason: '進貨補充',
          operator: 'admin',
          createdAt: new Date()
        }
      ],
      total: 1
    };

    return c.json(result);
  }
}