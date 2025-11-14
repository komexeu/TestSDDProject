import { injectable, inject } from 'tsyringe';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';
import { GetOrderDetailQueryHandler } from '@domains/order/application/queries/get-order-detail.query';
import { CancelOrderUseCase } from '@domains/order/application/use-cases/cancel-order/cancel-order.usecase';
import { CompleteOrderUseCase } from '@domains/order/application/use-cases/complete-order/complete-order.usecase';
import { ConfirmOrderUseCase } from '@domains/order/application/use-cases/confirm-order/confirm-order.usecase';
import { StartPreparationUseCase } from '@domains/order/application/use-cases/start-preparation/start-preparation.usecase';
import { MarkReadyForPickupUseCase } from '@domains/order/application/use-cases/mark-ready-for-pickup/mark-ready-for-pickup.usecase';
import { GetOrderListQueryHandler } from '@domains/order/application/queries/get-order-list.query';
import { EditOrderUseCase } from '@domains/order/application/use-cases/edit-order/edit-order.usecase'
import { Context } from 'hono';

/**
 * OrderController
 * 處理訂單相關的 HTTP 請求，包含建立、查詢、狀態流轉、編輯、取消、完成等功能
 */
@injectable()
export class OrderController {
  constructor(
    @inject('CreateOrderUseCase') private readonly createOrderUseCase: CreateOrderUseCase,
    @inject('EditOrderUseCase') private readonly editOrderUseCase: EditOrderUseCase,
    @inject('CancelOrderUseCase') private readonly cancelOrderUseCase: CancelOrderUseCase,
    @inject('CompleteOrderUseCase') private readonly completeOrderUseCase: CompleteOrderUseCase,
    @inject('ConfirmOrderUseCase') private readonly confirmOrderUseCase: ConfirmOrderUseCase,
    @inject('StartPreparationUseCase') private readonly startPreparationUseCase: StartPreparationUseCase,
    @inject('MarkReadyForPickupUseCase') private readonly markReadyForPickupUseCase: MarkReadyForPickupUseCase,
    @inject('GetOrderDetailQueryHandler') private readonly getOrderDetailQueryHandler: GetOrderDetailQueryHandler,
    @inject('GetOrderListQueryHandler') private readonly getOrderListQueryHandler: GetOrderListQueryHandler
  ) { }
  /**
   * 查詢訂單狀態
   * @param c Hono Context
   * @returns { status } 或 404/500
   */
  async getOrderStatus(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      const result = await this.getOrderDetailQueryHandler.execute({ orderId });
      if (!result) {
        return c.json({ message: '查無此訂單' }, 404);
      }
      return c.json({ status: result.status }, 200);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  }

  /**
   * 編輯訂單內容
   * @param c Hono Context
   * @returns { message } 或 400
   */
  async editOrder(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      const userId = c.req.header('x-user-id') || '';
      const body = await c.req.json();
      // 允許 description, items
      const { description, items } = body;
      await this.editOrderUseCase.execute({ orderId, userId, description, items });
      return c.json({ message: '訂單已更新' }, 200);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
  }

  /**
   * 建立新訂單
   * @param c Hono Context
   * @returns 新訂單資料或 400
   */
  async createOrder(c: Context) {
    try {
      const body = await c.req.json();
      const result = await this.createOrderUseCase.execute(body);
      return c.json(result, 201);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
  }

  /**
   * 查詢訂單明細
   * @param c Hono Context
   * @returns 訂單詳細資料或 404/500
   */
  async getOrderDetail(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      const result = await this.getOrderDetailQueryHandler.execute({ orderId });
      if (!result) {
        return c.json({ message: '查無此訂單' }, 404);
      }
      return c.json(result, 200);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  }

  /**
   * 查詢訂單列表
   * @param c Hono Context
   * @returns 訂單列表
   */
  async getOrderList(c: Context) {
    try {
      const limit = Number(c.req.query('limit')) || 10;
      const offset = Number(c.req.query('offset')) || 0;
      const userId = c.req.query('userId');
      const status = c.req.query('status');

      const result = await this.getOrderListQueryHandler.execute({
        limit,
        offset,
        userId,
        status,
      });

      return c.json(result, 200);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  }

  //#region status changes
  /**
   * 確認訂單
   * @param c Hono Context
   * @returns { message } 或 400
   */
  async confirmOrder(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      await this.confirmOrderUseCase.execute(orderId);
      return c.json({ message: '訂單已確認' }, 200);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
  }

  /**
   * 取消訂單
   * @param c Hono Context
   * @returns { message } 或 400
   */
  async cancelOrder(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      // 取消者: user/counter，預設 user
      const cancelledBy = c.req.header('x-cancel-by') === 'counter' ? 'counter' : 'user';
      await this.cancelOrderUseCase.execute(orderId, cancelledBy);
      return c.json({ message: '訂單已取消' }, 200);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
  }

  /**
   * 完成訂單
   * @param c Hono Context
   * @returns { message } 或 400
   */
  async completeOrder(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      await this.completeOrderUseCase.execute(orderId);
      return c.json({ message: '訂單已完成' }, 200);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
  }

  /**
   * 訂單進入製作中
   * @param c Hono Context
   * @returns { message } 或 400
   */
  async startPreparation(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      await this.startPreparationUseCase.execute(orderId);
      return c.json({ message: '訂單已進入製作中' }, 200);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
  }

  /**
   * 訂單可取餐
   * @param c Hono Context
   * @returns { message } 或 400
   */
  async markReadyForPickup(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      await this.markReadyForPickupUseCase.execute(orderId);
      return c.json({ message: '訂單已可取餐' }, 200);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
  }
  //#endregion
}
