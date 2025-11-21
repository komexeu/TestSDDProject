// LINE Webhook Controller
import { Context } from 'hono';
import { LineWebhookHandler } from '../../../domains/push/application/LineWebhookHandler';

const handler = new LineWebhookHandler();

export class LineWebhookController {
    /**
     * Hono 路由 handler
     */
    static async webhook(c: Context) {
        const signature = c.req.header('x-line-signature') || '';
        const body = await c.req.text();
        const result = await handler.handleWebhook(c.req, body, signature);
        return c.json(result.body, result.status as any);
    }
}
