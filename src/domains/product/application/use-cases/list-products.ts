import { UseCase } from '../../../../shared/application/interfaces/use-case';
import { ListProductsRequest, ListProductsResponse } from '../dto/product-dto';
import { IProductQueryRepository } from '../../domain/repositories/product-repository';

export class ListProductsUseCase implements UseCase<ListProductsRequest, ListProductsResponse> {
  constructor(private readonly productQueryRepository: IProductQueryRepository) {}

  async execute(request: ListProductsRequest): Promise<ListProductsResponse> {
    const products = await this.productQueryRepository.findByFilters({
      name: request.name,
      minPrice: request.minPrice,
      maxPrice: request.maxPrice,
      isActive: request.isActive
    });

    // 排序邏輯
    let sortedProducts = [...products];
    if (request.sortBy) {
      sortedProducts.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (request.sortBy) {
          case 'name':
            aVal = a.name.value;
            bVal = b.name.value;
            break;
          case 'price':
            aVal = a.price.amount;
            bVal = b.price.amount;
            break;
          case 'createdAt':
            aVal = a.createdAt;
            bVal = b.createdAt;
            break;
          default:
            return 0;
        }

        if (request.order === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        } else {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
      });
    }

    return {
      products: sortedProducts.map(product => ({
        id: product.id.value,
        name: product.name.value,
        description: product.description.value,
        price: product.price.amount,
        code: product.code?.value,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      })),
      total: sortedProducts.length
    };
  }
}