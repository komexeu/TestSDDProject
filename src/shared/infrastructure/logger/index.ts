// 簡單的日誌介面
export interface Logger {
  info(message: string, meta?: Record<string, any>): void;
  error(message: string, error?: Error, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
}

// 控制台日誌實作
export class ConsoleLogger implements Logger {
  info(message: string, meta?: Record<string, any>): void {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
  }

  error(message: string, error?: Error, meta?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, error?.message, meta ? JSON.stringify(meta) : '');
    if (error?.stack) {
      console.error(error.stack);
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }
}

// 單例日誌器
export class LoggerFactory {
  private static instance: Logger;

  public static getLogger(): Logger {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new ConsoleLogger();
    }
    return LoggerFactory.instance;
  }
}