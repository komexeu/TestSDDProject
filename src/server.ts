import { serve } from '@hono/node-server';
import app from './app';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`🚀 Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`);
  console.log(`📋 Health check: http://localhost:${info.port}/health`);
  console.log(`🛍️  Products API: http://localhost:${info.port}/api/products`);
  console.log(`📊 Inventory API: http://localhost:${info.port}/api/inventory/:productId`);
});