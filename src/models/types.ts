// 訂單系統核心型別定義

export type User = {
  id: string; // Line userId
  name: string;
  createdAt: Date;
};

export type Item = {
  id: string;
  orderId: string;
  name: string;
  quantity: number;
  price: number;
};

export type OrderStatus =
  | '已點餐'
  | '已確認訂單'
  | '製作中'
  | '可取餐'
  | '已取餐完成'
  | '已取消'
  | '製作失敗'
  | '異常';

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  items: Item[];
  createdAt: Date;
  updatedAt: Date;
  canceledBy?: 'user' | 'counter' | null;
  errorMsg?: string | null;
};

export type StatusHistory = {
  orderId: string;
  status: OrderStatus;
  updatedAt: Date;
};

export type Counter = {
  id: string;
  name: string;
};

export type Kitchen = {
  id: string;
  name: string;
};
