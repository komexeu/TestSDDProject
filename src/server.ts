import { serve } from '@hono/node-server';
import app from './app';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isDebug = process.env.DEBUG === '*' || process.env.NODE_ENV === 'development';

if (isDebug) {
  console.log('🐛 Debug mode enabled');
  console.log('📁 Current working directory:', process.cwd());
  console.log('🌱 Environment:', process.env.NODE_ENV || 'development');
}

console.log(`🚀 Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`);
  console.log(`📋 Health check: http://localhost:${info.port}/health`);
  console.log(`🛍️  Products API: http://localhost:${info.port}/api/products`);
  console.log(`📦 Orders API: http://localhost:${info.port}/api/orders`);
  console.log(`📊 Inventory API: http://localhost:${info.port}/api/inventory/:productId`);
  
  if (isDebug) {
    console.log('🔍 Debug information:');
    console.log('   - Use Chrome DevTools: chrome://inspect');
    console.log('   - Use VS Code debugger: F5');
    console.log('   - Set breakpoints in your TypeScript files');
  }
});