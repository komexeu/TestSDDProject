// 庫存管理相關 DTO
export interface GetStockRequest {
  productId: string;
}

export interface GetStockResponse {
  productId: string;
  quantity: number;
  updatedAt: Date;
}

export interface AdjustStockRequest {
  productId: string;
  quantity: number;
  reason: string;
  operator: string;
}

export interface AdjustStockResponse {
  productId: string;
  previousQuantity: number;
  newQuantity: number;
  delta: number;
  reason: string;
  operator: string;
  updatedAt: Date;
}

export interface SaleStockRequest {
  productId: string;
  quantity: number;
  operator?: string;
}

export interface SaleStockResponse {
  productId: string;
  remainingStock: number;
  soldQuantity: number;
  operator: string;
  timestamp: Date;
}

export interface GetInventoryLogsRequest {
  productId: string;
  limit?: number;
  offset?: number;
}

export interface GetInventoryLogsResponse {
  logs: Array<{
    id: string;
    productId: string;
    beforeQuantity: number;
    afterQuantity: number;
    delta: number;
    operationType: string;
    reason: string;
    operator: string;
    createdAt: Date;
  }>;
  total: number;
}