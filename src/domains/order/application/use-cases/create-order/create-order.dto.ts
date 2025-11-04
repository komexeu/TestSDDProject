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
  status: string;
  totalAmount: number;
  createdAt: Date;
}
