// LINE 推播 API Route
import { Hono } from 'hono';
import { linePushController } from '@interfaces/http/controllers/linePushController';

const router = new Hono();

router.post('/push/line', linePushController);

export default router;
