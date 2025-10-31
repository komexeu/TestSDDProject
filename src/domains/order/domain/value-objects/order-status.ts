import { ValueObject } from '../../../../shared/domain/value-objects/common';

// 訂單狀態值物件
export class OrderStatus extends ValueObject<string> {
  public static readonly 已點餐 = new OrderStatus('已點餐');
  public static readonly 已確認訂單 = new OrderStatus('已確認訂單');
  public static readonly 製作中 = new OrderStatus('製作中');
  public static readonly 可取餐 = new OrderStatus('可取餐');
  public static readonly 已取餐完成 = new OrderStatus('已取餐完成');
  public static readonly 已取消 = new OrderStatus('已取消');
  public static readonly 製作失敗 = new OrderStatus('製作失敗');
  public static readonly 異常 = new OrderStatus('異常');


  constructor(value: string) {
    const validStatuses = [
      '已點餐', '已確認訂單', '製作中', '可取餐', 
      '已取餐完成', '已取消', '製作失敗', '異常'
    ];
    
    if (!validStatuses.includes(value)) {
      throw new Error(`Invalid order status: ${value}`);
    }
    super(value);
  }


  public isActive(): boolean {
    return !['已取餐完成', '已取消', '製作失敗'].includes(this._value);
  }

  public isCancellable(): boolean {
    return ['已點餐', '已確認訂單'].includes(this._value);
  }
}