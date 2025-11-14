import { injectable } from 'tsyringe';
import { Order } from '@domains/order/domain/entities/order';
import { OrderStatus, OrderStatusCode } from '@domains/order/domain/value-objects/order-status';
import { BusinessRuleError } from '@shared/application/exceptions';

// 訂單狀態機領域服務
@injectable()
export class OrderStateMachineService {
  /**
   * 狀態轉換規則
   */
  public static readonly ALLOWED_TRANSITIONS: Record<OrderStatusCode, OrderStatusCode[]> = {
    [OrderStatusCode.已點餐]: [OrderStatusCode.已確認訂單, OrderStatusCode.已取消],
    [OrderStatusCode.已確認訂單]: [OrderStatusCode.製作中, OrderStatusCode.已取消],
    [OrderStatusCode.製作中]: [OrderStatusCode.可取餐],
    [OrderStatusCode.可取餐]: [OrderStatusCode.已取餐完成],
    [OrderStatusCode.已取餐完成]: [],
    [OrderStatusCode.已取消]: [],
    [OrderStatusCode.製作失敗]: [],
    [OrderStatusCode.異常]: [],
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
    // 轉回 OrderStatus[]
    return allowed.map(code => {
      switch (code) {
        case OrderStatusCode.已點餐: return OrderStatus.已點餐;
        case OrderStatusCode.已確認訂單: return OrderStatus.已確認訂單;
        case OrderStatusCode.製作中: return OrderStatus.製作中;
        case OrderStatusCode.可取餐: return OrderStatus.可取餐;
        case OrderStatusCode.已取餐完成: return OrderStatus.已取餐完成;
        case OrderStatusCode.已取消: return OrderStatus.已取消;
        case OrderStatusCode.製作失敗: return OrderStatus.製作失敗;
        case OrderStatusCode.異常: return OrderStatus.異常;
        default: throw new Error(`未知狀態代號: ${code}`);
      }
    });
  }

  /**
   * 檢查訂單是否可以被取消
   */
  public canBeCancelled(order: Order): boolean {
    // 僅 已點餐 或 已確認訂單 可取消
    return (
      order.status.value === OrderStatus.已點餐.value ||
      order.status.value === OrderStatus.已確認訂單.value
    );
  }

  /**
   * 檢查訂單是否還在處理中
   */
  public isInProgress(order: Order): boolean {
    // 已點餐、已確認訂單、製作中 視為處理中
    return [
      OrderStatus.已點餐.value,
      OrderStatus.已確認訂單.value,
      OrderStatus.製作中.value
    ].includes(order.status.value);
  }
}