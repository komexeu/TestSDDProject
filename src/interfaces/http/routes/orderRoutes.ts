import { Hono } from 'hono';
import { OrderController } from '../controllers/orderController';

export function createOrderRoutes(orderController: OrderController) {
  const orderRoutes = new Hono();

  orderRoutes.post('/orders', (c) => orderController.createOrder(c));
  orderRoutes.get('/orders/:orderId', (c) => orderController.getOrderDetail(c));

  return orderRoutes;
}
