import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler, requestLogger } from '@interfaces/http/middleware/common';
import { createProductRoutes } from '@interfaces/http/routes/product-routes';
import { createInventoryRoutes } from '@interfaces/http/routes/inventory-routes';
import { createOrderRoutes } from '@interfaces/http/routes/orderRoutes';

// 控制器
import { ProductController } from '@interfaces/http/controllers/product-controller';
import { InventoryController } from '@interfaces/http/controllers/inventory-controller';
import { OrderController } from '@interfaces/http/controllers/orderController';

// Order 相關依賴
import { OrderAppService } from '@domains/order/application/service/order-app-service';
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';

// 依賴注入設定
function setupDependencies() {
  // 控制器（暫時使用簡化版本）
  const productController = new ProductController();
  const inventoryController = new InventoryController();
  
  // Order 相關依賴注入
  const orderRepository = new PrismaOrderRepository();
  const eventPublisher = new InMemoryDomainEventPublisher();
  const orderAppService = new OrderAppService(orderRepository, eventPublisher);
  const orderController = new OrderController(orderAppService, orderRepository, eventPublisher);

  return {
    productController,
    inventoryController,
    orderController
  };
}

// 建立應用程式
function createApp() {
  const app = new Hono();

  // CORS 中間件 - 允許端口 5173 的請求
  app.use('*', cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173','http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));

  // 全域中間件
  app.use('*', requestLogger);
  app.use('*', errorHandler);

  // 設定依賴
  const { productController, inventoryController, orderController } = setupDependencies();

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
  app.route('/', createInventoryRoutes(inventoryController));
  app.route('/api', createOrderRoutes(orderController));

  return app;
}

const app = createApp();

export default app;
export const callback = app.fetch;