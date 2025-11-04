import { Hono } from 'hono';
import { errorHandler, requestLogger } from '@/interfaces/http/middleware/common';
import { createProductRoutes } from '@/interfaces/http/routes/product-routes';
import { createInventoryRoutes } from '@/interfaces/http/routes/inventory-routes';

// 控制器
import { ProductController } from '@/interfaces/http/controllers/product-controller';
import { InventoryController } from '@/interfaces/http/controllers/inventory-controller';

// 依賴注入設定
function setupDependencies() {
  // 控制器（暫時使用簡化版本）
  const productController = new ProductController();
  const inventoryController = new InventoryController();

  return {
    productController,
    inventoryController
  };
}

// 建立應用程式
function createApp() {
  const app = new Hono();

  // 全域中間件
  app.use('*', requestLogger);
  app.use('*', errorHandler);

  // 設定依賴
  const { productController, inventoryController } = setupDependencies();

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

  return app;
}

const app = createApp();

export default app;
export const callback = app.fetch;