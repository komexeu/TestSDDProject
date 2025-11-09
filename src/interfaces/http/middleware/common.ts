import { MiddlewareHandler } from 'hono';
import { LoggerFactory } from '@shared/infrastructure/logger';
import { ApplicationError } from '@shared/application/exceptions';

const logger = LoggerFactory.getLogger();

// 錯誤處理中間件
export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    logger.error('Request error', error as Error, {
      method: c.req.method,
      url: c.req.url,
      userAgent: c.req.header('User-Agent')
    });

    if (error instanceof ApplicationError) {
      const status = getStatusFromError(error);
      return c.json({
        error: {
          code: error.code || 'APPLICATION_ERROR',
          message: error.message
        }
      }, status as any);
    }

    // 未預期的錯誤
    return c.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    }, 500 as any);
  }
};

// 請求日誌中間件
export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const isDebug = process.env.DEBUG === '*' || process.env.NODE_ENV === 'development';
  
  if (isDebug) {
    console.log(`🔍 [${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);
    console.log(`   Headers:`, Object.fromEntries(c.req.raw.headers));
    
    // 如果有 body，嘗試記錄（僅用於調試）
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
      console.log(`   Body: [Request body will be processed by handler]`);
    }
  }
  
  await next();
  
  const duration = Date.now() - start;
  
  if (isDebug) {
    console.log(`✅ [${new Date().toISOString()}] ${c.req.method} ${c.req.url} - ${c.res.status} (${duration}ms)`);
  }
  
  logger.info('Request completed', {
    method: c.req.method,
    url: c.req.url,
    status: c.res.status,
    duration: `${duration}ms`
  });
};

// 管理員認證中間件
export const adminAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authorization header required'
      }
    }, 401 as any);
  }

  // 這裡應該驗證 JWT token
  // 暫時簡單驗證
  const token = authHeader.substring(7);
  if (token !== 'admin-token') {
    return c.json({
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid admin token'
      }
    }, 403 as any);
  }

  // 將管理員資訊存到 context
  c.set('admin', { id: 'admin-1', name: 'Admin' });
  await next();
};

function getStatusFromError(error: ApplicationError): number {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'CONFLICT':
      return 409;
    case 'BUSINESS_RULE_VIOLATION':
      return 422;
    default:
      return 500;
  }
}