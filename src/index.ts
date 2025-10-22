import { Hono } from 'hono';
import productApi from './api/product';

const app = new Hono();
app.route('/api', productApi);

export default app;
