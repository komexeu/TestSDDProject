// LINE 推播 API Controller
import { LinePushService } from '@domains/push/application/LinePushService';
import { Context } from 'hono';

const linePushService = new LinePushService();

export async function linePushController(c: Context) {
  const { userId, orderId, message } = await c.req.json();
  if (!userId || !orderId || !message) {
    return c.json({ success: false, error: 'Missing required fields' }, 400);
  }
  const result = await linePushService.pushOrderStatus(userId, orderId, message);
  if (result.success) {
    return c.json({ success: true });
  } else {
    return c.json({ success: false, error: result.error }, 500);
  }
}
