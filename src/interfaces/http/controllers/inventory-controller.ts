import { Context } from 'hono';
import { GetStockUseCase } from '../../../domains/inventory/application/use-cases/get-stock';
import { AdjustStockUseCase } from '../../../domains/inventory/application/use-cases/adjust-stock';
import { SaleStockUseCase } from '../../../domains/inventory/application/use-cases/sale-stock';
import { GetInventoryLogsUseCase } from '../../../domains/inventory/application/use-cases/get-inventory-logs';
import { PrismaClient } from '@prisma/client';

export class InventoryController {
  private prisma: PrismaClient;
  private getStockUseCase: GetStockUseCase;
  private adjustStockUseCase: AdjustStockUseCase;
  private saleStockUseCase: SaleStockUseCase;
  private getInventoryLogsUseCase: GetInventoryLogsUseCase;

  constructor() {
    this.prisma = new PrismaClient();
    this.getStockUseCase = new GetStockUseCase(this.prisma);
    this.adjustStockUseCase = new AdjustStockUseCase(this.prisma);
    this.saleStockUseCase = new SaleStockUseCase(this.prisma);
    this.getInventoryLogsUseCase = new GetInventoryLogsUseCase(this.prisma);
  }

  async getStock(c: Context) {
    const productId = c.req.param('productId');
    try {
      const result = await this.getStockUseCase.execute({ productId });
      return c.json(result);
    } catch (error) {
      return c.json({ error: 'Product not found' }, 404);
    }
  }

  async adjustStock(c: Context) {
    const productId = c.req.param('productId');
    const data = await c.req.json();
    
    try {
      const result = await this.adjustStockUseCase.execute({
        productId,
        quantity: data.quantity,
        reason: data.reason,
        operator: data.operator
      });
      return c.json(result);
    } catch (error) {
      return c.json({ error: 'Adjustment failed' }, 400);
    }
  }

  async saleStock(c: Context) {
    const data = await c.req.json();
    
    try {
      const result = await this.saleStockUseCase.execute({
        productId: data.productId,
        quantity: data.quantity,
        operator: data.operator || 'system'
      });
      return c.json(result);
    } catch (error) {
      return c.json({ error: 'Sale failed' }, 400);
    }
  }

  async getInventoryLogs(c: Context) {
    const productId = c.req.param('productId');
    try {
      const result = await this.getInventoryLogsUseCase.execute({ productId });
      return c.json(result.logs);
    } catch (error) {
      return c.json({ error: 'Failed to get logs' }, 500);
    }
  }
}
