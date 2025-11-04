import { Hono } from 'hono';
import { ProductController } from '@interfaces/http/controllers/product-controller';
import { adminAuth } from '@interfaces/http/middleware/common';

export function createProductRoutes(productController: ProductController): Hono {
  const app = new Hono();

  // 公開路由 - 查詢產品
  app.get('/products', (c) => productController.listProducts(c));
  app.get('/products/:id', (c) => productController.getProduct(c));

  // 需要管理員權限的路由
  app.use('/products/*', adminAuth);
  app.post('/products', (c) => productController.createProduct(c));
  app.put('/products/:id', (c) => productController.updateProduct(c));

  return app;
}