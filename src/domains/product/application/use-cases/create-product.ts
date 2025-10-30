import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { CreateProductRequest, CreateProductResponse } from '../dto/product-dto';
import { ProductRepository } from '../../domain/repositories/product-repository';
import { Product } from '../../domain/entities/product';
import { ProductName, ProductDescription, ProductPrice, ProductCode } from '../../domain/value-objects/product-properties';
import { ProductManagementService } from '../../domain/services/product-management';
import { DomainEventPublisher } from '../../../../shared/domain/events/domain-event';
import { ValidationError } from '../../../../shared/application/exceptions';

export class CreateProductUseCase implements UseCase<CreateProductRequest, CreateProductResponse> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productManagementService: ProductManagementService,
    private readonly eventPublisher: DomainEventPublisher
  ) {}

  async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
    // 建立領域物件
    const name = new ProductName(request.name);
    const description = new ProductDescription(request.description);
    const price = new ProductPrice(request.price);
    const code = request.code ? new ProductCode(request.code) : undefined;

    // 驗證商品名稱唯一性
    await this.productManagementService.validateUniqueProductName(name);

    // 建立產品聚合
    const product = Product.create(name, description, price, code);

    // 驗證產品資料
    this.productManagementService.validateProductForCreation(product);

    // 儲存產品
    await this.productRepository.save(product);

    // 發布領域事件
    const domainEvents = product.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventPublisher.publish(event);
    }
    product.clearDomainEvents();

    return {
      id: product.id.value,
      name: product.name.value,
      description: product.description.value,
      price: product.price.amount,
      code: product.code?.value,
      isActive: product.isActive,
      createdAt: product.createdAt
    };
  }
}