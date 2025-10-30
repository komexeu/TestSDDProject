// 基礎值物件抽象類別
export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = Object.freeze(value);
  }

  public get value(): T {
    return this._value;
  }

  public equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }

  public toString(): string {
    return JSON.stringify(this._value);
  }
}

// ID 值物件
export class Id extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ID cannot be empty');
    }
    super(value.trim());
  }

  static generate(): Id {
    return new Id(crypto.randomUUID());
  }
}

// 金額值物件
export class Money extends ValueObject<{ amount: number; currency: string }> {
  constructor(amount: number, currency: string = 'TWD') {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency cannot be empty');
    }
    super({ amount, currency: currency.toUpperCase() });
  }

  get amount(): number {
    return this._value.amount;
  }

  get currency(): string {
    return this._value.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }
}