import "reflect-metadata";
import { container } from 'tsyringe';
import fg from 'fast-glob';
import path from 'path';
import { ProductRepository } from '@domains/product/infrastructure/repositories/product-repository.prisma';
import { ProductQueryRepository } from '@domains/product/infrastructure/repositories/product-repository.prisma';
import { ProductManagementService } from '@domains/product/domain/services/product-management';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';
import { CreateProductUseCase } from '@domains/product/application/use-cases/create-product';
import { GetProductUseCase } from '@domains/product/application/use-cases/get-product';
import { UpdateProductUseCase } from '@domains/product/application/use-cases/update-product';
import { ListProductsUseCase } from '@domains/product/application/use-cases/list-products';
import { PrismaOrderRepository } from '@domains/order/infrastructure/repositories/prisma-order-repository';
import { OrderAppService } from '@domains/order/application/service/order-app-service';

// 掃描 pattern，可依需求調整
const patterns = [
  path.join(__dirname, '../**/!(*.test|*.spec).{ts,js}'),
];

// 立即註冊基礎依賴
container.register('ProductRepository', { useClass: ProductRepository });
container.register('ProductQueryRepository', { useClass: ProductQueryRepository });
container.register('ProductManagementService', { useClass: ProductManagementService });
container.register('DomainEventPublisher', { useClass: InMemoryDomainEventPublisher });
container.register('OrderRepository', { useClass: PrismaOrderRepository });
container.register('OrderAppService', { useClass: OrderAppService });

// 立即註冊 UseCase，避免 async IIFE 時序問題
container.register('CreateProductUseCase', { useClass: CreateProductUseCase });
container.register('GetProductUseCase', { useClass: GetProductUseCase });
container.register('UpdateProductUseCase', { useClass: UpdateProductUseCase });
container.register('ListProductsUseCase', { useClass: ListProductsUseCase });

(async () => {
  const files = await fg(patterns, { absolute: true });
  for (const file of files) {
    // 只載入 Service/Repository/Publisher 檔案
    if (!/(Service|Repository|Publisher)\.(ts|js)$/.test(file)) continue;
    // 動態 import
    const mod = require(file);
    for (const key of Object.keys(mod)) {
      const exported = mod[key];
      // 判斷是否為 class 且名稱結尾正確
      if (
        typeof exported === 'function' &&
        exported.prototype &&
        /(?:Service|Repository|Publisher)$/.test(exported.name)
      ) {
        // 用 class 名稱註冊
        container.register(exported.name, { useClass: exported });
        // 也可用 symbol 或自訂 token 註冊
        // console.log(`Registered: ${exported.name}`);
      }
    }
  }
})();
