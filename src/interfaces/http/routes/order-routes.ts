import { Hono } from 'hono';
import { OrderController } from '../controllers/order-controller';

export function createOrderRoutes(orderController: OrderController): Hono {
    const orderRoutes = new Hono();

    orderRoutes.post('/orders', (c) => orderController.createOrder(c));
    orderRoutes.get('/orders/list', (c) => orderController.getOrderList(c));
    orderRoutes.get('/orders/:orderId', (c) => orderController.getOrderDetail(c));

    // 編輯訂單
    orderRoutes.put('/orders/:orderId', (c) => orderController.editOrder(c));

    return orderRoutes;
}
