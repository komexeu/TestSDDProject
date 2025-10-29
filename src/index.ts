import { Hono } from 'hono';
import productApi from './api/product';
import inventory from './routes/inventory';


const app = new Hono();
app.route('/api', productApi);
app.route('/', inventory);

export default app;
export const callback = app.fetch;
