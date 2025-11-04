/**
 * 建立訂單用例的 Request DTO
 */
export interface CreateOrderRequest {
  userId: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  description?: string; // 預設空字串
}

/**
 * 建立訂單用例的 Response DTO
 */
export interface CreateOrderResponse {
  orderId: string;
  userId: string;
  items: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  description: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
}
