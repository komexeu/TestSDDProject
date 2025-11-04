import { Product } from '@/domains/product/domain/entities/product';
import { ProductName } from '@/domains/product/domain/value-objects/product-properties';
import { IProductRepository } from '@/domains/product/domain/repositories/product-repository';
import { BusinessRuleError } from '@/shared/application/exceptions';

// 產品管理領域服務
export class ProductManagementService {
  constructor(private readonly productRepository: IProductRepository) {}

  /**
   * 驗證產品名稱是否唯一
   */
  public async validateUniqueProductName(name: ProductName, excludeProductId?: string): Promise<void> {
    const existingProduct = await this.productRepository.findByName(name);
    
    if (existingProduct && existingProduct.id.value !== excludeProductId) {
      throw new BusinessRuleError(`產品名稱 "${name.value}" 已存在`);
    }
  }

  /**
   * 檢查產品是否可以被刪除
   */
  public canProductBeDeleted(product: Product): boolean {
    // 這裡可以加入更複雜的業務規則
    // 例如：檢查是否有未完成的訂單包含此產品
    return product.isActive;
  }

  /**
   * 批量停用產品
   */
  public async deactivateProducts(products: Product[]): Promise<void> {
    for (const product of products) {
      if (product.isActive) {
        product.deactivate();
        await this.productRepository.save(product);
      }
    }
  }

  /**
   * 根據業務規則驗證產品資料
   */
  public validateProductForCreation(product: Product): void {
    if (!product.name.value || product.name.value.trim().length === 0) {
      throw new BusinessRuleError('產品名稱不能為空');
    }

    if (!product.description.value || product.description.value.trim().length === 0) {
      throw new BusinessRuleError('產品描述不能為空');
    }

    if (product.price.amount <= 0) {
      throw new BusinessRuleError('產品價格必須大於 0');
    }
  }
}