import { OrderStatusCode } from '@domains/order/domain/value-objects/order-status';
import { OrderStateMachineService } from '@domains/order/domain/services/order-state-mechine-service';

/**
 * 根據目前狀態取得下一個可轉換狀態（數字代號）
 */
export function getNextOrderStatus(current: number): OrderStatusCode[] {
    const code = current as OrderStatusCode;
    const allowed = OrderStateMachineService.ALLOWED_TRANSITIONS[code] || [];
    return allowed;
}
