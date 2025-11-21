import { Hono } from 'hono';
import { LineWebhookController } from '../controllers/line-webhook-controller';

export function createLineWebhookRoutes() {
    const router = new Hono();
    router.post('/line/webhook', LineWebhookController.webhook);
    return router;
}
