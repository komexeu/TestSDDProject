import { ValueObject, Money } from '../../../../shared/domain/value-objects/common';

// 產品代碼值物件
export class ProductCode extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Product code cannot be empty');
    }
    if (value.trim().length > 20) {
      throw new Error('Product code cannot exceed 20 characters');
    }
    super(value.trim().toUpperCase());
  }
}

// 產品名稱值物件
export class ProductName extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }
    if (value.trim().length > 100) {
      throw new Error('Product name cannot exceed 100 characters');
    }
    super(value.trim());
  }
}

// 產品描述值物件
export class ProductDescription extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Product description cannot be empty');
    }
    if (value.trim().length > 500) {
      throw new Error('Product description cannot exceed 500 characters');
    }
    super(value.trim());
  }
}

// 產品價格值物件
export class ProductPrice extends Money {
  constructor(amount: number, currency: string = 'TWD') {
    if (!Number.isInteger(amount)) {
      throw new Error('Product price must be an integer (in cents/smallest unit)');
    }
    if (amount <= 0) {
      throw new Error('Product price must be greater than 0');
    }
    super(amount, currency);
  }

  // 取得以元為單位的價格顯示
  public toDisplayString(): string {
    return `NT$ ${this.amount}`;
  }
}