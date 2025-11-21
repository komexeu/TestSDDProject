import 'reflect-metadata';
import './auto-di';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler, requestLogger } from '@interfaces/http/middleware/common';
import { createProductRoutes } from '@interfaces/http/routes/product-routes';
import { createInventoryRoutes } from '@interfaces/http/routes/inventory-routes';
import { createOrderRoutes } from '@interfaces/http/routes/order-routes';
import { createAuthRoutes } from '@interfaces/http/routes/line-auth-routes';

// 控制器
import { ProductController } from '@interfaces/http/controllers/product-controller';
import { InventoryController } from '@interfaces/http/controllers/inventory-controller';
import { OrderController } from '@interfaces/http/controllers/order-controller';
import { LineAuthController } from '@interfaces/http/controllers/line-auth-controller';

import { createLineWebhookRoutes } from '@interfaces/http/routes/line-webhook-routes';

import { container } from 'tsyringe';


// 建立應用程式
function createApp() {
  const app = new Hono();

  // CORS 中間件 - 允許端口 5173 的請求
  console.log('CORS middleware is being registered');
  app.use('*', cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174','https://sdd-ui-tunnel.komexeu.page'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'x-user-id'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['x-user-id', 'X-User-Id']
  }));
  console.log('CORS middleware registered');

  // 全域中間件
  app.use('*', requestLogger);
  app.use('*', errorHandler);

  // 直接用 tsyringe 取得 controller 實例
  const productController = container.resolve(ProductController);
  const orderController = container.resolve(OrderController);
  const inventoryController = new InventoryController();
  const lineAuthController = container.resolve(LineAuthController);

  // 健康檢查
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // API 路由
  app.route('/api', createProductRoutes(productController));
  app.route('/api', createInventoryRoutes(inventoryController));
  app.route('/api', createOrderRoutes(orderController));
  app.route('/api', createAuthRoutes(lineAuthController));
  // LINE webhook 路由（被動推播）
  app.route('/', createLineWebhookRoutes());
  return app;
}

const app = createApp();

export default app;
export const callback = app.fetch;