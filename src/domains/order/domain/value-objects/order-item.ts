import { ValueObject } from '@/shared/domain/value-objects/common';

// 訂單項目值物件

export class OrderItem extends ValueObject<{
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}> {
  constructor(id: string, productId: string, name: string, quantity: number, price: number) {
    if (!id || id.trim().length === 0) {
      throw new Error('訂單項目 ID 不可為空');
    }
    if (!productId || productId.trim().length === 0) {
      throw new Error('商品 ID 不可為空');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('訂單項目名稱不可為空');
    }
    if (quantity <= 0) {
      throw new Error('數量必須大於 0');
    }
    if (price < 0) {
      throw new Error('價格不可為負數');
    }

    super({
      id: id.trim(),
      productId: productId.trim(),
      name: name.trim(),
      quantity,
      price
    });
  }

  get id(): string {
    return this._value.id;
  }


  get productId(): string {
    return this._value.productId;
  }

  get name(): string {
    return this._value.name;
  }

  get quantity(): number {
    return this._value.quantity;
  }

  get price(): number {
    return this._value.price;
  }

  get totalPrice(): number {
    return this.quantity * this.price;
  }

  public withQuantity(newQuantity: number): OrderItem {
    return new OrderItem(this.id, this.productId, this.name, newQuantity, this.price);
  }
  /**
   * 顯式宣告 equals 以利型別推斷與 IDE 提示
   */
  public equals(other: OrderItem): boolean {
    return super.equals(other);
  }
}