import { injectable, inject } from 'tsyringe';

import { Context } from 'hono';
import { ValidationError, NotFoundError } from '@shared/application/exceptions';
import { CreateProductUseCase } from '@domains/product/application/use-cases/create-product';
import { GetProductUseCase } from '@domains/product/application/use-cases/get-product';
import { UpdateProductUseCase } from '@domains/product/application/use-cases/update-product';
import { ListProductsUseCase } from '@domains/product/application/use-cases/list-products';
import { CreateProductRequest, UpdateProductRequest, GetProductRequest, ListProductsRequest } from '@domains/product/application/dto/product-dto';

@injectable()
export class ProductController {
  constructor(
    @inject('CreateProductUseCase') private readonly createProductUseCase: CreateProductUseCase,
    @inject('GetProductUseCase') private readonly getProductUseCase: GetProductUseCase,
    @inject('UpdateProductUseCase') private readonly updateProductUseCase: UpdateProductUseCase,
    @inject('ListProductsUseCase') private readonly listProductsUseCase: ListProductsUseCase
  ) {}

  async createProduct(c: Context) {
    const data = await c.req.json<CreateProductRequest>();
    // 這裡可加額外驗證
    const result = await this.createProductUseCase.execute(data);
    return c.json(result, 201);
  }

  async getProduct(c: Context) {
    const productId = c.req.param('id');
    const req: GetProductRequest = { productId };
    try {
      const result = await this.getProductUseCase.execute(req);
      return c.json(result);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return c.json({ message: '找不到產品' }, 404);
      }
      throw err;
    }
  }

  async updateProduct(c: Context) {
    const productId = c.req.param('id');
    const data = await c.req.json<UpdateProductRequest>();
    const req: UpdateProductRequest = { ...data, productId };
    try {
      const result = await this.updateProductUseCase.execute(req);
      return c.json(result);
    } catch (err) {
      if (err instanceof NotFoundError) {
        return c.json({ message: '找不到產品' }, 404);
      }
      throw err;
    }
  }

  async listProducts(c: Context) {
    const query = c.req.query();
    const req: ListProductsRequest = {
      name: query.name,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
      sortBy: query.sortBy,
      order: query.order as 'asc' | 'desc' | undefined
    };
    const result = await this.listProductsUseCase.execute(req);
    return c.json(result);
  }
}