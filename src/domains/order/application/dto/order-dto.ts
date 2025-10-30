// 建立訂單用例的 DTO
export interface CreateOrderRequest {
  userId: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface CreateOrderResponse {
  orderId: string;
  userId: string;
  status: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  createdAt: Date;
}

// 訂單狀態轉換用例的 DTO
export interface TransitionOrderStatusRequest {
  orderId: string;
  targetStatus: string;
}

export interface TransitionOrderStatusResponse {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: Date;
}

// 取消訂單用例的 DTO
export interface CancelOrderRequest {
  orderId: string;
  cancelledBy: 'user' | 'counter';
}

export interface CancelOrderResponse {
  orderId: string;
  status: string;
  cancelledBy: 'user' | 'counter';
  updatedAt: Date;
}

// 查詢訂單用例的 DTO
export interface GetOrderRequest {
  orderId: string;
}

export interface GetOrderResponse {
  orderId: string;
  userId: string;
  status: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  cancelledBy?: 'user' | 'counter' | null;
  errorMessage?: string | null;
}