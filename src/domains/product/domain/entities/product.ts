// Prisma 型別（僅用於轉換）
import type { Product as PrismaProduct } from '@prisma/client';
import { AggregateRoot } from '../../../../shared/domain/entities/base';
import { Id } from '../../../../shared/domain/value-objects/common';
import { ProductName, ProductDescription, ProductPrice, ProductCode } from '../value-objects/product-properties';
import { BusinessRuleError } from '../../../../shared/application/exceptions';
import { DomainEvent } from '../../../../shared/domain/events/domain-event';

// 產品 ID 值物件
export class ProductId extends Id {
  constructor(value: string) {
    super(value);
  }
}

// 領域事件
export class ProductCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string = 'ProductCreated';
  readonly aggregateId: string;

  constructor(public readonly productId: string, public readonly productName: string) {
    this.occurredOn = new Date();
    this.aggregateId = productId;
  }
}

export class ProductUpdatedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string = 'ProductUpdated';
  readonly aggregateId: string;

  constructor(public readonly productId: string) {
    this.occurredOn = new Date();
    this.aggregateId = productId;
  }
}

export class ProductDeletedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType: string = 'ProductDeleted';
  readonly aggregateId: string;

  constructor(public readonly productId: string) {
    this.occurredOn = new Date();
    this.aggregateId = productId;
  }
}

// 產品聚合根
export class Product extends AggregateRoot<ProductId> {
  private _code?: ProductCode;
  private _stock: number = 0;
  private _name: ProductName;
  private _description: ProductDescription;
  private _price: ProductPrice;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _isActive: boolean;

  constructor(
    id: ProductId,
    name: ProductName,
    description: ProductDescription,
    price: ProductPrice,
    code?: ProductCode,
    createdAt?: Date,
    updatedAt?: Date,
    isActive?: boolean,
    stock?: number
  ) {
    super(id);
    
    this._name = name;
    this._description = description;
    this._price = price;
    this._code = code;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._isActive = isActive !== undefined ? isActive : true;
    this._stock = stock ?? 0;

    // 如果是新建立的產品，發布事件
    if (!createdAt) {
      this.addDomainEvent(new ProductCreatedEvent(id.value, name.value));
    }
  }

  // 靜態工廠方法：建立新產品
  public static create(
    name: ProductName,
    description: ProductDescription,
    price: ProductPrice,
    code?: ProductCode
  ): Product {
    const productId = new ProductId(Id.generate().value);
    return new Product(productId, name, description, price, code);
  }

  // Getters
  get code(): ProductCode | undefined {
    return this._code;
  }
  get stock(): number {
    return this._stock;
  }
  // Prisma 轉換靜態方法
  public static fromPrisma(prismaProduct: PrismaProduct): Product {
    return new Product(
      new ProductId(prismaProduct.id),
      new ProductName(prismaProduct.name),
      new ProductDescription(prismaProduct.description),
      new ProductPrice(prismaProduct.price),
      prismaProduct.code ? new ProductCode(prismaProduct.code) : undefined,
      prismaProduct.createdAt,
      prismaProduct.updatedAt,
      prismaProduct.isActive,
      prismaProduct.stock
    );
  }

  // 轉換為 Prisma 格式
  public toPrisma(): any {
    return {
      id: this.id.value,
      name: this._name.value,
      description: this._description.value,
      price: this._price.value,
      code: this._code ? this._code.value : undefined,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isActive: this._isActive,
      stock: this._stock,
    };
  }

  get name(): ProductName {
    return this._name;
  }

  get description(): ProductDescription {
    return this._description;
  }

  get price(): ProductPrice {
    return this._price;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  // 業務方法：更新產品資訊
  public updateInfo(
    name: ProductName,
    description: ProductDescription,
    price: ProductPrice
  ): void {
    this._name = name;
    this._description = description;
    this._price = price;
    this._updatedAt = new Date();

    this.addDomainEvent(new ProductUpdatedEvent(this.id.value));
  }

  // 業務方法：設定產品代碼
  public setCode(code: ProductCode): void {
    this._code = code;
    this._updatedAt = new Date();

    this.addDomainEvent(new ProductUpdatedEvent(this.id.value));
  }

  // 業務方法：更新價格
  public updatePrice(newPrice: ProductPrice): void {
    this._price = newPrice;
    this._updatedAt = new Date();

    this.addDomainEvent(new ProductUpdatedEvent(this.id.value));
  }

  // 業務方法：停用產品
  public deactivate(): void {
    if (!this._isActive) {
      throw new BusinessRuleError('Product is already deactivated');
    }
    
    this._isActive = false;
    this._updatedAt = new Date();

    this.addDomainEvent(new ProductUpdatedEvent(this.id.value));
  }

  // 業務方法：啟用產品
  public activate(): void {
    if (this._isActive) {
      throw new BusinessRuleError('Product is already active');
    }
    
    this._isActive = true;
    this._updatedAt = new Date();

    this.addDomainEvent(new ProductUpdatedEvent(this.id.value));
  }

  // 業務方法：軟刪除產品
  public delete(): void {
    this.deactivate();
    this.addDomainEvent(new ProductDeletedEvent(this.id.value));
  }

  // 業務方法：驗證產品是否可以被訂購
  public canBeOrdered(): boolean {
    return this._isActive;
  }
}