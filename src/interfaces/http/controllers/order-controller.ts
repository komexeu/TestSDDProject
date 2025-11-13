import { injectable, inject } from 'tsyringe';
import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';
import { GetOrderDetailQueryHandler } from '@domains/order/application/queries/get-order-detail.query';
import { GetOrderListQueryHandler } from '@domains/order/application/queries/get-order-list.query';
import { EditOrderUseCase } from '@domains/order/application/use-cases/edit-order/edit-order.usecase'
import { Context } from 'hono';

@injectable()
export class OrderController {
  constructor(
    @inject('CreateOrderUseCase') private readonly createOrderUseCase: CreateOrderUseCase,
    @inject('EditOrderUseCase') private readonly editOrderUseCase: EditOrderUseCase,
    private readonly getOrderDetailQueryHandler: GetOrderDetailQueryHandler,
    private readonly getOrderListQueryHandler: GetOrderListQueryHandler
  ) { }

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

  async createOrder(c: Context) {
    try {
      const body = await c.req.json();
      const result = await this.createOrderUseCase.execute(body);
      return c.json(result, 201);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
  }

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
}
