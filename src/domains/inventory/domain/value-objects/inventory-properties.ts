import { ValueObject } from '../../../../shared/domain/value-objects/common';

// 庫存數量值物件
export class StockQuantity extends ValueObject<number> {
  constructor(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error('Stock quantity must be an integer');
    }
    if (value < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    super(value);
  }

  public add(quantity: StockQuantity): StockQuantity {
    return new StockQuantity(this._value + quantity._value);
  }

  public subtract(quantity: StockQuantity): StockQuantity {
    const result = this._value - quantity._value;
    if (result < 0) {
      throw new Error('Insufficient stock');
    }
    return new StockQuantity(result);
  }

  public isZero(): boolean {
    return this._value === 0;
  }

  public isGreaterThan(quantity: StockQuantity): boolean {
    return this._value > quantity._value;
  }

  public isLessThan(quantity: StockQuantity): boolean {
    return this._value < quantity._value;
  }
}

// 庫存操作類型值物件
export class InventoryOperationType extends ValueObject<string> {
  public static readonly MANUAL_ADJUSTMENT = new InventoryOperationType('手動調整');
  public static readonly SALE = new InventoryOperationType('銷售');
  public static readonly RESTOCK = new InventoryOperationType('補貨');
  public static readonly RETURN = new InventoryOperationType('退貨');
  public static readonly DAMAGE = new InventoryOperationType('損壞');
  public static readonly INITIAL = new InventoryOperationType('初始化');

  public static get VALID_OPERATIONS() {
    return ['手動調整', '銷售', '補貨', '退貨', '損壞', '初始化'];
  }

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Operation type cannot be empty');
    }
    if (!InventoryOperationType.VALID_OPERATIONS.includes(value.trim())) {
      throw new Error(`Invalid operation type: ${value}`);
    }
    super(value.trim());
  }
}

// 操作者值物件
export class Operator extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Operator cannot be empty');
    }
    if (value.trim().length > 50) {
      throw new Error('Operator name cannot exceed 50 characters');
    }
    super(value.trim());
  }
}

// 操作原因值物件
export class OperationReason extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Operation reason cannot be empty');
    }
    if (value.trim().length > 200) {
      throw new Error('Operation reason cannot exceed 200 characters');
    }
    super(value.trim());
  }
}