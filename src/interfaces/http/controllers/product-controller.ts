import { Context } from 'hono';
import { ValidationError } from '../../../shared/application/exceptions';

// 臨時簡化的產品控制器（暫時不依賴用例）
export class ProductController {
  constructor() {}

  // 建立產品
  async createProduct(c: Context) {
    const data = await c.req.json();
    
    // 基本驗證
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      throw new ValidationError('商品名稱不得為空', 'name');
    }
    if (!data.description || typeof data.description !== 'string') {
      throw new ValidationError('商品描述不得為空', 'description');
    }
    if (typeof data.price !== 'number' || !Number.isInteger(data.price) || data.price <= 0) {
      throw new ValidationError('售價必須為大於 0 的整數（新台幣元）', 'price');
    }

    // 模擬回應
    const result = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      price: data.price,
      code: data.code,
      isActive: true,
      createdAt: new Date()
    };

    return c.json(result, 201 as any);
  }

  // 取得產品詳情
  async getProduct(c: Context) {
    const productId = c.req.param('id');
    
    // 模擬回應
    const result = {
      id: productId,
      name: '示例產品',
      description: '這是一個示例產品',
      price: 100,
      code: 'DEMO001',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return c.json(result);
  }

  // 更新產品
  async updateProduct(c: Context) {
    const productId = c.req.param('id');
    const data = await c.req.json();

    // 模擬回應
    const result = {
      id: productId,
      name: data.name || '更新的產品',
      description: data.description || '更新的描述',
      price: data.price || 150,
      code: data.code,
      isActive: true,
      updatedAt: new Date()
    };

    return c.json(result);
  }

  // 查詢產品列表
  async listProducts(c: Context) {
    const query = c.req.query();
    
    // 模擬回應
    const result = {
      products: [
        {
          id: '1',
          name: '產品 1',
          description: '產品 1 描述',
          price: 100,
          code: 'PRD001',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: '產品 2',
          description: '產品 2 描述',
          price: 200,
          code: 'PRD002',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      total: 2
    };

    return c.json(result);
  }
}