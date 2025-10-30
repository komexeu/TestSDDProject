import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { UpdateProductRequest, UpdateProductResponse } from '../dto/product-dto';
import { ProductRepository } from '../../domain/repositories/product-repository';
import { ProductId } from '../../domain/entities/product';
import { ProductName, ProductDescription, ProductPrice, ProductCode } from '../../domain/value-objects/product-properties';
import { ProductManagementService } from '../../domain/services/product-management';
import { DomainEventPublisher } from '../../../../shared/domain/events/domain-event';
import { NotFoundError } from '../../../../shared/application/exceptions';

export class UpdateProductUseCase implements UseCase<UpdateProductRequest, UpdateProductResponse> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productManagementService: ProductManagementService,
    private readonly eventPublisher: DomainEventPublisher
  ) {}

  async execute(request: UpdateProductRequest): Promise<UpdateProductResponse> {
    const productId = new ProductId(request.productId);
    const product = await this.productRepository.findById(productId);
    
    if (!product) {
      throw new NotFoundError('Product', request.productId);
    }

    // 如果要更新名稱，驗證唯一性
    if (request.name) {
      const newName = new ProductName(request.name);
      await this.productManagementService.validateUniqueProductName(newName, productId.value);
    }

    // 更新產品資訊
    if (request.name || request.description || request.price) {
      const name = request.name ? new ProductName(request.name) : product.name;
      const description = request.description ? new ProductDescription(request.description) : product.description;
      const price = request.price ? new ProductPrice(request.price) : product.price;
      
      product.updateInfo(name, description, price);
    }

    // 更新產品代碼
    if (request.code) {
      const code = new ProductCode(request.code);
      product.setCode(code);
    }

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
      updatedAt: product.updatedAt
    };
  }
}