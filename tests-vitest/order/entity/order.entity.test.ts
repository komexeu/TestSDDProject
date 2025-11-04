import { describe, it, expect } from 'vitest';
import { Order, OrderId, UserId } from '@domains/order/domain/entities/order';
import { OrderStatus } from '@domains/order/domain/value-objects/order-status';
import { OrderItem } from '@domains/order/domain/value-objects/order-item';
import { BusinessRuleError } from '@shared/application/exceptions';


function createOrder({
  status = OrderStatus.已點餐,
  items = [new OrderItem('i-1', 'p-1', '商品A', 2, 50)],
  description = '',
  cancelledBy = undefined,
  errorMessage = undefined
}: Partial<{ status: OrderStatus; items: OrderItem[]; description: string; cancelledBy: 'user' | 'counter'; errorMessage: string }> = {}) {
  return new Order(
    new OrderId('o-1'),
    new UserId('u-1'),
    items,
    description,
    status,
    new Date('2025-11-04T00:00:00Z'),
    new Date('2025-11-04T00:00:00Z'),
    cancelledBy,
    errorMessage
  );
}

describe('Order Entity', () => {
  describe('OrderItem 值物件驗證', () => {
    it('id 不可為空', () => {
      expect(() => new OrderItem('', 'p-1', '商品A', 1, 10)).toThrow('訂單項目 ID 不可為空');
    });
    it('productId 不可為空', () => {
      expect(() => new OrderItem('i-1', '', '商品A', 1, 10)).toThrow('商品 ID 不可為空');
    });
    it('name 不可為空', () => {
      expect(() => new OrderItem('i-1', 'p-1', '', 1, 10)).toThrow('訂單項目名稱不可為空');
    });
    it('quantity 必須大於 0', () => {
      expect(() => new OrderItem('i-1', 'p-1', '商品A', 0, 10)).toThrow('數量必須大於 0');
      expect(() => new OrderItem('i-1', 'p-1', '商品A', -1, 10)).toThrow('數量必須大於 0');
    });
    it('price 不可為負數', () => {
      expect(() => new OrderItem('i-1', 'p-1', '商品A', 1, -1)).toThrow('價格不可為負數');
    });
    it('totalPrice 正確', () => {
      const item = new OrderItem('i-1', 'p-1', '商品A', 3, 20);
      expect(item.totalPrice).toBe(60);
    });
  });
  it('建立訂單時必須有至少一項餐點', () => {
    expect(() => createOrder({ items: [] })).toThrow(BusinessRuleError);
  });

  it('計算總金額正確', () => {
    const order = createOrder({
      items: [
        new OrderItem('i-1', 'p-1', '商品A', 2, 50),
        new OrderItem('i-2', 'p-2', '商品B', 1, 30)
      ]
    });
    expect(order.totalAmount).toBe(2 * 50 + 1 * 30);
  });

  it('setConfirm 狀態轉換為已確認訂單', () => {
    const order = createOrder({ status: OrderStatus.已點餐 });
    order.setConfirm();
    expect(order.status.value).toBe(OrderStatus.已確認訂單.value);
  });

  it('setStartPreparation 狀態轉換為製作中', () => {
    const order = createOrder({ status: OrderStatus.已確認訂單 });
    order.setStartPreparation();
    expect(order.status.value).toBe(OrderStatus.製作中.value);
  });

  it('setMarkReadyForPickup 狀態轉換為可取餐', () => {
    const order = createOrder({ status: OrderStatus.製作中 });
    order.setMarkReadyForPickup();
    expect(order.status.value).toBe(OrderStatus.可取餐.value);
  });

  it('setComplete 僅可於可取餐狀態執行', () => {
    const order = createOrder({ status: OrderStatus.可取餐 });
    order.setComplete();
    expect(order.status.value).toBe(OrderStatus.已取餐完成.value);
    // 非可取餐狀態應丟錯
    const order2 = createOrder({ status: OrderStatus.已點餐 });
    expect(() => order2.setComplete()).toThrow(BusinessRuleError);
  });

  it('setFail 僅可於製作中狀態執行', () => {
    const order = createOrder({ status: OrderStatus.製作中 });
    order.setFail('失敗原因');
    expect(order.status.value).toBe(OrderStatus.製作失敗.value);
    expect(order.errorMessage).toBe('失敗原因');
    // 非製作中狀態應丟錯
    const order2 = createOrder({ status: OrderStatus.已點餐 });
    expect(() => order2.setFail('x')).toThrow(BusinessRuleError);
  });

  it('cancel 僅可於已點餐/已確認訂單狀態執行', () => {
    const order = createOrder({ status: OrderStatus.已點餐 });
    order.cancel('user');
    expect(order.status.value).toBe(OrderStatus.已取消.value);
    expect(order.cancelledBy).toBe('user');
    // 非允許狀態應丟錯
    const order2 = createOrder({ status: OrderStatus.製作中 });
    expect(() => order2.cancel('user')).toThrow(BusinessRuleError);
  });

  it('canBeCancelled 與 isInProgress 行為正確', () => {
    expect(createOrder({ status: OrderStatus.已點餐 }).canBeCancelled()).toBe(true);
    expect(createOrder({ status: OrderStatus.已確認訂單 }).canBeCancelled()).toBe(true);
    expect(createOrder({ status: OrderStatus.製作中 }).canBeCancelled()).toBe(false);
    expect(createOrder({ status: OrderStatus.已點餐 }).isInProgress()).toBe(true);
    expect(createOrder({ status: OrderStatus.已確認訂單 }).isInProgress()).toBe(true);
    expect(createOrder({ status: OrderStatus.製作中 }).isInProgress()).toBe(true);
    expect(createOrder({ status: OrderStatus.可取餐 }).isInProgress()).toBe(false);
  });
});
