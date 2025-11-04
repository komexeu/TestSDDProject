
import { describe, it, expect, vi } from 'vitest';
import { sendOrderNotification } from '../../src/domains/order/domain/services/order-notification-service';
import { OrderId, Order, UserId } from '../../src/domains/order/domain/entities/order';
import { OrderStatus } from '../../src/domains/order/domain/value-objects/order-status';
import { OrderItem } from '../../src/domains/order/domain/value-objects/order-item';

describe('訂單通知服務', () => {
  it('建立訂單時應發送通知', () => {
    const order = new Order(
      new OrderId('O001'),
      new UserId('U001'),
      [new OrderItem('oi1', 'P001', '珍奶', 1, 60)],
      new OrderStatus('已點餐'),
      new Date(),
      new Date()
    );
    const notify = vi.fn();
    sendOrderNotification(order, notify);
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ id: 'O001', status: '已點餐' }));
  });

  it('通知內容應包含訂單狀態與商品資訊', () => {
    const order = new Order(
      new OrderId('O002'),
      new UserId('U002'),
      [new OrderItem('oi2', 'P002', '紅茶', 1, 40)],
      new OrderStatus('可取餐'),
      new Date(),
      new Date()
    );
    const notify = vi.fn();
    sendOrderNotification(order, notify);
    const callArg = notify.mock.calls[0][0];
    expect(callArg.status).toBe('可取餐');
    expect(callArg.items[0].name).toBe('紅茶');
  });
});
