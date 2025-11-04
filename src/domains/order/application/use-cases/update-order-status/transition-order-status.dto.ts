// DTO for order status transition use case

/**
 * 訂單狀態轉換請求 DTO
 */
export interface TransitionOrderStatusRequest {
  /**
   * 訂單ID
   */
  orderId: string;
  /**
   * 目標狀態（如：'已點餐', '已確認訂單', '製作中', '可取餐', '已取餐完成', '已取消', '製作失敗', '異常'）
   */
  targetStatus: string;
}

/**
 * 訂單狀態轉換回應 DTO
 */
export interface TransitionOrderStatusResponse {
  /**
   * 訂單ID
   */
  orderId: string;
  /**
   * 原本狀態
   */
  previousStatus: string;
  /**
   * 新狀態
   */
  newStatus: string;
  /**
   * 狀態更新時間
   */
  updatedAt: Date;
}
