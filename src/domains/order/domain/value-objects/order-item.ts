import { ValueObject } from '../../../../shared/domain/value-objects/common';

// 訂單項目值物件
export class OrderItem extends ValueObject<{
  id: string;
  name: string;
  quantity: number;
  price: number;
}> {
  constructor(id: string, name: string, quantity: number, price: number) {
    if (!id || id.trim().length === 0) {
      throw new Error('Order item ID cannot be empty');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Order item name cannot be empty');
    }
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }

    super({
      id: id.trim(),
      name: name.trim(),
      quantity,
      price
    });
  }

  get id(): string {
    return this._value.id;
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
    return new OrderItem(this.id, this.name, newQuantity, this.price);
  }
}