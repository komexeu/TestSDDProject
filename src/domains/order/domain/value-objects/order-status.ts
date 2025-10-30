import { ValueObject } from '../../../../shared/domain/value-objects/common';

// 訂單狀態值物件
export class OrderStatus extends ValueObject<string> {
  public static readonly ORDERED = new OrderStatus('已點餐');
  public static readonly CONFIRMED = new OrderStatus('已確認訂單');
  public static readonly IN_PREPARATION = new OrderStatus('製作中');
  public static readonly READY_FOR_PICKUP = new OrderStatus('可取餐');
  public static readonly COMPLETED = new OrderStatus('已取餐完成');
  public static readonly CANCELLED = new OrderStatus('已取消');
  public static readonly PREPARATION_FAILED = new OrderStatus('製作失敗');
  public static readonly EXCEPTION = new OrderStatus('異常');

  private static readonly ALLOWED_TRANSITIONS: Record<string, string[]> = {
    '已點餐': ['已確認訂單', '已取消'],
    '已確認訂單': ['製作中', '已取消'],
    '製作中': ['可取餐', '製作失敗'],
    '可取餐': ['已取餐完成'],
    '已取餐完成': [],
    '已取消': [],
    '製作失敗': [],
    '異常': [],
  };

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

  public canTransitionTo(targetStatus: OrderStatus): boolean {
    const allowedTransitions = OrderStatus.ALLOWED_TRANSITIONS[this._value] || [];
    return allowedTransitions.includes(targetStatus._value);
  }

  public isActive(): boolean {
    return !['已取餐完成', '已取消', '製作失敗'].includes(this._value);
  }

  public isCancellable(): boolean {
    return ['已點餐', '已確認訂單'].includes(this._value);
  }
}