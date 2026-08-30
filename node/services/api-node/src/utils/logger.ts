export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  [key: string]: any;
}

/**
 * Safely sanitizes and stringifies objects handling circular structures (like Express Request/Response objects) and sensitive data
 */
function safeSerialize(data: any): any {
  if (data === undefined || data === null) return data;
  if (typeof data !== 'object') return data;

  // Don't serialize raw Express Request/Response/Socket objects
  if (data.writableEnded !== undefined || data._header !== undefined || data.socket !== undefined) {
    return '[Express Response/Request Object]';
  }

  try {
    const cache = new Set();
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (key === 'password' || key === 'passwordHash') return '***[REDACTED]***';
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular]';
          }
          cache.add(value);
        }
        return value;
      })
    );
  } catch (e) {
    return '[Unserializable Data]';
  }
}

export class Logger {
  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const env = process.env.NODE_ENV || 'development';
    const safeContext = safeSerialize(context);

    if (env === 'production') {
      return JSON.stringify({
        timestamp,
        level,
        service: 'api-node',
        environment: env,
        message,
        ...safeContext,
      });
    } else {
      const colors: Record<LogLevel, string> = {
        info: '\x1b[36m',  // Cyan
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[90m', // Gray
      };
      const reset = '\x1b[0m';
      const ctxStr = safeContext && Object.keys(safeContext).length > 0 ? ` ${JSON.stringify(safeContext)}` : '';
      return `${colors[level]}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}${ctxStr}`;
    }
  }

  info(message: string, context?: LogContext) {
    console.log(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.format('error', message, context));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, context));
    }
  }

  /**
   * Traces the entry, exit, execution time, path, input data, and output data of any function safely
   */
  async traceFn<T>(
    fnName: string,
    filePath: string,
    inputData: LogContext,
    action: () => Promise<T> | T
  ): Promise<T> {
    const start = Date.now();
    this.info(`👉 [Fn ENTER] ${fnName}`, { function: fnName, path: filePath, inputData });
    try {
      const result = await action();
      const durationMs = Date.now() - start;
      
      // If result is an Express Response object, don't dump the socket, just log status
      const resultMeta = result && typeof result === 'object' && (result as any).statusCode
        ? { status: (result as any).statusCode }
        : result;

      this.info(`👈 [Fn EXIT] ${fnName}`, {
        function: fnName,
        path: filePath,
        durationMs: `${durationMs}ms`,
        outputData: resultMeta,
      });
      return result;
    } catch (err: any) {
      const durationMs = Date.now() - start;
      this.error(`💥 [Fn ERROR] ${fnName}`, { function: fnName, path: filePath, error: err.message, durationMs: `${durationMs}ms` });
      throw err;
    }
  }
}

export const logger = new Logger();
