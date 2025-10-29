// 商品管理專用型別
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // 新台幣整數，>0
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  name: string;
}
