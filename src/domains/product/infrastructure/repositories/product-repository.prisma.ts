import { injectable } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import { IProductRepository, IProductQueryRepository } from '@domains/product/domain/repositories/product-repository';
import { Product, ProductId } from '@domains/product/domain/entities/product';
import { ProductName } from '@domains/product/domain/value-objects/product-properties';

const prisma = new PrismaClient();

@injectable()
export class ProductRepository implements IProductRepository {
  async findById(id: ProductId): Promise<Product | null> {
    const data = await prisma.product.findUnique({ where: { id: id.value } });
    return data ? Product.fromPrisma(data) : null;
  }

  async findByName(name: ProductName): Promise<Product | null> {
    const data = await prisma.product.findUnique({ where: { name: name.value } });
    return data ? Product.fromPrisma(data) : null;
  }

  async findAll(): Promise<Product[]> {
    const data = await prisma.product.findMany();
    return data.map(Product.fromPrisma);
  }

  async findActiveProducts(): Promise<Product[]> {
    const data = await prisma.product.findMany({ where: { isActive: true } });
    return data.map(Product.fromPrisma);
  }

  async save(product: Product): Promise<void> {
    const data = product.toPrisma();
    await prisma.product.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async delete(id: ProductId): Promise<void> {
    await prisma.product.delete({ where: { id: id.value } });
  }

  async exists(name: ProductName): Promise<boolean> {
    const count = await prisma.product.count({ where: { name: name.value } });
    return count > 0;
  }
}

@injectable()
export class ProductQueryRepository implements IProductQueryRepository {
  async findByNamePattern(pattern: string): Promise<Product[]> {
    const data = await prisma.product.findMany({
      where: { name: { contains: pattern } },
    });
    return data.map(Product.fromPrisma);
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const data = await prisma.product.findMany({
      where: { price: { gte: minPrice, lte: maxPrice } },
    });
    return data.map(Product.fromPrisma);
  }

  async findByFilters(filters: { name?: string; minPrice?: number; maxPrice?: number; isActive?: boolean; }): Promise<Product[]> {
    const data = await prisma.product.findMany({
      where: {
        name: filters.name ? { contains: filters.name } : undefined,
        price: filters.minPrice !== undefined || filters.maxPrice !== undefined ? {
          gte: filters.minPrice,
          lte: filters.maxPrice,
        } : undefined,
        isActive: filters.isActive,
      },
    });
    return data.map(Product.fromPrisma);
  }
}
