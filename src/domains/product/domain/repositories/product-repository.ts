import { Product, ProductId } from '@/domains/product/domain/entities/product';
import { ProductName } from '@/domains/product/domain/value-objects/product-properties';

// 產品倉儲介面
export interface IProductRepository {
  findById(id: ProductId): Promise<Product | null>;
  findByName(name: ProductName): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findActiveProducts(): Promise<Product[]>;
  save(product: Product): Promise<void>;
  delete(id: ProductId): Promise<void>;
  exists(name: ProductName): Promise<boolean>;
}

// 產品查詢介面
export interface IProductQueryRepository {
  findByNamePattern(pattern: string): Promise<Product[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
  findByFilters(filters: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
  }): Promise<Product[]>;
}