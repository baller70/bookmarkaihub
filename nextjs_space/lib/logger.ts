/**
 * Structured Logging Utility
 * Console-based logging with structured JSON output for production environments
 * Integrates with Sentry for error tracking when configured
 */

import * as Sentry from '@sentry/nextjs'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  requestId?: string
  path?: string
  method?: string
  duration?: number
  statusCode?: number
  error?: Error | unknown
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  environment: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Minimum log level based on environment
const MIN_LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

/**
 * Format error for logging (extract useful info without circular refs)
 */
function formatError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines
    }
  }
  return { raw: String(error) }
}

/**
 * Create a structured log entry
 */
function createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: process.env.NODE_ENV || 'development',
  }

  if (context) {
    // Handle error objects specially
    if (context.error) {
      context.error = formatError(context.error)
    }
    entry.context = context
  }

  return entry
}

/**
 * Output log entry to console
 */
function outputLog(entry: LogEntry): void {
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction) {
    // JSON output for production (easier to parse by log aggregators)
    console[entry.level === 'debug' ? 'log' : entry.level](JSON.stringify(entry))
  } else {
    // Pretty output for development
    const color = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    }[entry.level]
    const reset = '\x1b[0m'
    
    const prefix = `${color}[${entry.level.toUpperCase()}]${reset}`
    const timestamp = `\x1b[90m${entry.timestamp}${reset}`
    
    console[entry.level === 'debug' ? 'log' : entry.level](
      `${timestamp} ${prefix} ${entry.message}`,
      entry.context ? entry.context : ''
    )
  }
}

/**
 * Check if log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

/**
 * Send error to Sentry with context
 */
function captureToSentry(level: LogLevel, message: string, context?: LogContext): void {
  if (level === 'error') {
    // For errors, capture as exception if we have an error object, otherwise as message
    if (context?.error instanceof Error) {
      Sentry.captureException(context.error, {
        extra: { ...context, error: undefined },
        tags: {
          userId: context.userId,
          path: context.path,
        },
      })
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        extra: context,
        tags: {
          userId: context?.userId,
          path: context?.path,
        },
      })
    }
  } else if (level === 'warn') {
    // Capture warnings as breadcrumbs, not as separate events
    Sentry.addBreadcrumb({
      category: 'logger',
      message,
      level: 'warning',
      data: context,
    })
  }
}

// Logger API
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      outputLog(createLogEntry('debug', message, context))
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      outputLog(createLogEntry('info', message, context))
      // Add as breadcrumb for Sentry context
      Sentry.addBreadcrumb({
        category: 'logger',
        message,
        level: 'info',
        data: context,
      })
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      outputLog(createLogEntry('warn', message, context))
      captureToSentry('warn', message, context)
    }
  },

  error(message: string, context?: LogContext): void {
    if (shouldLog('error')) {
      outputLog(createLogEntry('error', message, context))
      captureToSentry('error', message, context)
    }
  },

  // Log an HTTP request/response
  request(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    this[level](`${method} ${path} ${statusCode}`, {
      ...context,
      method,
      path,
      statusCode,
      duration,
    })
  },

  // Set user context for Sentry
  setUser(user: { id: string; email?: string; username?: string } | null): void {
    Sentry.setUser(user)
  },

  // Add custom tag for filtering in Sentry
  setTag(key: string, value: string): void {
    Sentry.setTag(key, value)
  },

  // Start a performance transaction
  startTransaction(name: string, op: string): Sentry.Span | undefined {
    return Sentry.startInactiveSpan({ name, op })
  },
}

// Export individual log functions for convenience
export const { debug, info, warn, error } = logger
export default logger

