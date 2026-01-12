/**
 * Logger Service
 * Centralized logging with structured output and log levels
 * Replaces console.log/error throughout the codebase
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  context?: LogContext;
  requestId?: string;
}

// Current log level (can be set via environment)
let currentLogLevel: LogLevel = process.env.NODE_ENV === 'test' ? LogLevel.NONE : LogLevel.DEBUG;

// Request ID for tracing (set per-request via middleware)
let currentRequestId: string | undefined;

/**
 * Set the global log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Set the current request ID (call from middleware)
 */
export function setRequestId(requestId: string | undefined): void {
  currentRequestId = requestId;
}

/**
 * Get current request ID
 */
export function getRequestId(): string | undefined {
  return currentRequestId;
}

/**
 * Initialize logger from environment
 */
export function initLogger(): void {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  const nodeEnv = process.env.NODE_ENV;
  
  switch (envLevel) {
    case 'DEBUG':
      currentLogLevel = LogLevel.DEBUG;
      break;
    case 'INFO':
      currentLogLevel = LogLevel.INFO;
      break;
    case 'WARN':
      currentLogLevel = LogLevel.WARN;
      break;
    case 'ERROR':
      currentLogLevel = LogLevel.ERROR;
      break;
    case 'NONE':
      currentLogLevel = LogLevel.NONE;
      break;
    default:
      // Default to NONE in test, INFO in production, DEBUG in development
      currentLogLevel = nodeEnv === 'test'
        ? LogLevel.NONE
        : nodeEnv === 'production'
          ? LogLevel.INFO
          : LogLevel.DEBUG;
  }

  log.info('Logger', 'Logger initialized', { level: LogLevel[currentLogLevel] });
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    // JSON format for production (easier to parse in log aggregators)
    return JSON.stringify(entry);
  }
  
  // Human-readable format for development
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  const requestStr = entry.requestId ? ` [req:${entry.requestId.substring(0, 8)}]` : '';
  return `[${entry.timestamp}] [${entry.level}] [${entry.module}]${requestStr} ${entry.message}${contextStr}`;
}

/**
 * Core log function
 */
function logMessage(level: LogLevel, module: string, message: string, context?: LogContext): void {
  if (level < currentLogLevel) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: LogLevel[level],
    module,
    message,
    context,
    requestId: currentRequestId
  };

  const formatted = formatLogEntry(entry);

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formatted);
      break;
    case LogLevel.INFO:
      console.info(formatted);
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    case LogLevel.ERROR:
      console.error(formatted);
      break;
  }
}

/**
 * Logger interface
 */
export const log = {
  debug: (module: string, message: string, context?: LogContext) => 
    logMessage(LogLevel.DEBUG, module, message, context),
  
  info: (module: string, message: string, context?: LogContext) => 
    logMessage(LogLevel.INFO, module, message, context),
  
  warn: (module: string, message: string, context?: LogContext) => 
    logMessage(LogLevel.WARN, module, message, context),
  
  error: (module: string, message: string, context?: LogContext) => 
    logMessage(LogLevel.ERROR, module, message, context),

  // Convenience method for logging errors with stack trace
  exception: (module: string, message: string, error: Error, context?: LogContext) => 
    logMessage(LogLevel.ERROR, module, message, {
      ...context,
      error: error.message,
      stack: error.stack
    })
};

/**
 * Create a scoped logger for a specific module
 */
export function createLogger(module: string) {
  return {
    debug: (message: string, context?: any) => log.debug(module, message, context),
    info: (message: string, context?: any) => log.info(module, message, context),
    warn: (message: string, context?: any) => log.warn(module, message, context),
    error: (message: string, context?: any) => log.error(module, message, context),
    exception: (message: string, error: Error, context?: any) => 
      log.exception(module, message, error, context)
  };
}

/**
 * Express middleware to add request ID and log requests
 */
export function requestLogger() {
  return (req: any, res: any, next: any) => {
    // Generate or use existing request ID
    const requestId = req.headers['x-request-id'] || 
                      `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    setRequestId(requestId);
    
    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);

    // Log request
    const startTime = Date.now();
    log.info('HTTP', `${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      ip: req.ip || req.socket?.remoteAddress
    });

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 400 ? 'warn' : 'info';
      
      log[level]('HTTP', `${req.method} ${req.path} ${res.statusCode}`, {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`
      });

      // Clear request ID
      setRequestId(undefined);
    });

    next();
  };
}

export default log;
