/**
 * 依據 OrderStatusCode 取得中文狀態名稱
 */
export function getOrderStatusName(code: OrderStatusCode): string {
  switch (code) {
    case OrderStatusCode.已點餐:
      return '已點餐';
    case OrderStatusCode.已確認訂單:
      return '已確認訂單';
    case OrderStatusCode.製作中:
      return '製作中';
    case OrderStatusCode.可取餐:
      return '可取餐';
    case OrderStatusCode.已取餐完成:
      return '已取餐完成';
    case OrderStatusCode.已取消:
      return '已取消';
    case OrderStatusCode.製作失敗:
      return '製作失敗';
    case OrderStatusCode.異常:
      return '異常';
    default:
      return String(code);
  }
}

import { ValueObject } from '@shared/domain/value-objects/common';

// 訂單狀態 enum 代號
export enum OrderStatusCode {
  已點餐 = 1,
  已確認訂單 = 2,
  製作中 = 3,
  可取餐 = 4,
  已取餐完成 = 5,
  已取消 = 6,
  製作失敗 = 7,
  異常 = 8,
}

// 訂單狀態值物件
export class OrderStatus extends ValueObject<OrderStatusCode> {
  public static readonly 已點餐 = new OrderStatus(OrderStatusCode.已點餐);
  public static readonly 已確認訂單 = new OrderStatus(OrderStatusCode.已確認訂單);
  public static readonly 製作中 = new OrderStatus(OrderStatusCode.製作中);
  public static readonly 可取餐 = new OrderStatus(OrderStatusCode.可取餐);
  public static readonly 已取餐完成 = new OrderStatus(OrderStatusCode.已取餐完成);
  public static readonly 已取消 = new OrderStatus(OrderStatusCode.已取消);
  public static readonly 製作失敗 = new OrderStatus(OrderStatusCode.製作失敗);
  public static readonly 異常 = new OrderStatus(OrderStatusCode.異常);

  constructor(value: OrderStatusCode) {
    if (!Object.values(OrderStatusCode).includes(value)) {
      throw new Error(`無效的訂單狀態：${value}`);
    }
    super(value);
  }
}