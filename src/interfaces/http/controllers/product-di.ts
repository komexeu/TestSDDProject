// 使用 tsyringe 進行 ProductController 依賴注入
import { container } from 'tsyringe';
import { ProductController } from './product-controller';
import { CreateProductUseCase } from '@domains/product/application/use-cases/create-product';
import { GetProductUseCase } from '@domains/product/application/use-cases/get-product';
import { UpdateProductUseCase } from '@domains/product/application/use-cases/update-product';
import { ListProductsUseCase } from '@domains/product/application/use-cases/list-products';
import { ProductRepository, ProductQueryRepository } from '@domains/product/infrastructure/repositories/product-repository.prisma';
import { ProductManagementService } from '@domains/product/domain/services/product-management';
import { InMemoryDomainEventPublisher } from '@shared/domain/events/domain-event';

// 註冊 repository/service/eventPublisher
container.register('ProductRepository', { useClass: ProductRepository });
container.register('ProductQueryRepository', { useClass: ProductQueryRepository });
container.register('ProductManagementService', { useClass: ProductManagementService });
container.register('DomainEventPublisher', { useClass: InMemoryDomainEventPublisher });

// 註冊 usecase
container.register('CreateProductUseCase', {
  useFactory: c => new CreateProductUseCase(
    c.resolve('ProductRepository'),
    c.resolve('ProductManagementService'),
    c.resolve('DomainEventPublisher')
  )
});
container.register('GetProductUseCase', {
  useFactory: c => new GetProductUseCase(c.resolve('ProductRepository'))
});
container.register('UpdateProductUseCase', {
  useFactory: c => new UpdateProductUseCase(
    c.resolve('ProductRepository'),
    c.resolve('ProductManagementService'),
    c.resolve('DomainEventPublisher')
  )
});
container.register('ListProductsUseCase', {
  useFactory: c => new ListProductsUseCase(c.resolve('ProductQueryRepository'))
});

// 註冊 controller
container.register('ProductController', {
  useFactory: c => new ProductController(
    c.resolve('CreateProductUseCase'),
    c.resolve('GetProductUseCase'),
    c.resolve('UpdateProductUseCase'),
    c.resolve('ListProductsUseCase')
  )
});

export function createProductController() {
  return container.resolve<ProductController>('ProductController');
}
