import { UseCase } from '@shared/application/interfaces/use-case';
import { injectable, inject } from 'tsyringe';
import { GetProductRequest, GetProductResponse } from '../dto/product-dto';
import { IProductRepository } from '@domains/product/domain/repositories/product-repository';
import { ProductId } from '@domains/product/domain/entities/product';
import { NotFoundError } from '@shared/application/exceptions';
@injectable()
export class GetProductUseCase implements UseCase<GetProductRequest, GetProductResponse> {
  constructor(@inject('ProductRepository') private readonly productRepository: IProductRepository) {}

  async execute(request: GetProductRequest): Promise<GetProductResponse> {
    const productId = new ProductId(request.productId);
    const product = await this.productRepository.findById(productId);
    
    if (!product) {
      throw new NotFoundError('Product', request.productId);
    }

    return {
      id: product.id.value,
      name: product.name.value,
      description: product.description.value,
      price: product.price.amount,
      code: product.code?.value,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }
}