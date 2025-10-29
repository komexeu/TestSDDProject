import { MiddlewareHandler } from 'hono';

// 假設以簡單 header 驗證 admin 權限
export const adminAuth: MiddlewareHandler = async (c, next) => {
  const role = c.req.header('x-role');
  if (role !== 'admin') {
    return c.json({ message: '僅限管理員操作' }, 403);
  }
  await next();
};
