import { Order, OrderId } from '../entities/order';
import { OrderStatus } from '../value-objects/order-status';
import { BusinessRuleError } from '../../../../shared/application/exceptions';

// 訂單狀態機領域服務
export class OrderStateMachineService {
  /**
   * 狀態轉換規則
   */
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

  /**
   * 驗證是否可以從目前狀態轉換到目標狀態
   */
  public static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const allowed = OrderStateMachineService.ALLOWED_TRANSITIONS[from.value] || [];
    return allowed.includes(to.value);
  }
  /**
   * 驗證訂單狀態轉換是否有效
   */
  public validateTransition(order: Order, targetStatus: OrderStatus): void {
    if (!OrderStateMachineService.canTransition(order.status, targetStatus)) {
      throw new BusinessRuleError(
        `無法從 ${order.status.value} 轉換到 ${targetStatus.value}`
      );
    }
  }

  /**
   * 取得可用的下一步狀態
   */
  public getAvailableTransitions(order: Order): OrderStatus[] {
    const currentStatus = order.status.value;
    const allowed = OrderStateMachineService.ALLOWED_TRANSITIONS[currentStatus] || [];
    // 將 string[] 轉回 OrderStatus[]
    return allowed.map(statusStr => {
      // 依照 OrderStatus 靜態屬性取得實例
      // @ts-ignore
      return OrderStatus[Object.keys(OrderStatus).find(k => OrderStatus[k].value === statusStr)!];
    });
  }

  /**
   * 檢查訂單是否可以被取消
   */
  public canBeCancelled(order: Order): boolean {
    return order.status.isCancellable();
  }

  /**
   * 檢查訂單是否還在處理中
   */
  public isInProgress(order: Order): boolean {
    return order.status.isActive();
  }
}