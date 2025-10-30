import { Order, OrderId } from '../entities/order';
import { OrderStatus } from '../value-objects/order-status';
import { BusinessRuleError } from '../../../../shared/application/exceptions';

// 訂單狀態機領域服務
export class OrderStateMachineService {
  
  /**
   * 驗證訂單狀態轉換是否有效
   */
  public validateTransition(order: Order, targetStatus: OrderStatus): void {
    if (!order.status.canTransitionTo(targetStatus)) {
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
    const transitions: Record<string, OrderStatus[]> = {
      '已點餐': [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      '已確認訂單': [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
      '製作中': [OrderStatus.READY_FOR_PICKUP, OrderStatus.PREPARATION_FAILED],
      '可取餐': [OrderStatus.COMPLETED],
      '已取餐完成': [],
      '已取消': [],
      '製作失敗': [],
      '異常': [],
    };

    return transitions[currentStatus] || [];
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