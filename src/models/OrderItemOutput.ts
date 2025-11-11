// 對應 openapi.yaml #/components/schemas/OrderItemOutput
export interface OrderItemOutput {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}
