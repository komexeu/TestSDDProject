import { CreateOrderUseCase } from '@domains/order/application/use-cases/create-order/create-order.usecase';
import { GetOrderDetailQueryHandler } from '@domains/order/application/queries/get-order-detail.query';
import { GetOrderListQueryHandler } from '@domains/order/application/queries/get-order-list.query';
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { DomainEventPublisher } from '@shared/domain/events/domain-event';
import { Context } from 'hono';

export class OrderController {
  constructor(
    private readonly orderAppService: OrderAppService,
    private readonly orderRepository: PrismaOrderRepository,
    private readonly eventPublisher: DomainEventPublisher
  ) {}

  async createOrder(c: Context) {
    try {
      const body = await c.req.json();
      const useCase = new CreateOrderUseCase(this.orderAppService, this.eventPublisher);
      const result = await useCase.execute(body);
      return c.json(result, 201);
    } catch (error) {
      return c.json({ message: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
  }

  async getOrderDetail(c: Context) {
    try {
      const orderId = c.req.param('orderId');
      const queryHandler = new GetOrderDetailQueryHandler(this.orderRepository);
      const result = await queryHandler.execute({ orderId });
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

      const queryHandler = new GetOrderListQueryHandler(this.orderRepository);
      const result = await queryHandler.execute({
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
