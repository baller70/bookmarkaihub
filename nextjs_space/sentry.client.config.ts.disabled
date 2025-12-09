// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production (0.1 = 10% is recommended for production)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Set profilesSampleRate to capture profiling data (optional, can help with performance debugging)
  // Recommended: 0.1 in production
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable automatic instrumentation
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Capture 10% of all sessions for session replay
      // Capture 100% of sessions with an error
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Replay settings - adjust for your needs
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Only send errors in production, unless SENTRY_DSN is explicitly set in dev
  enabled: process.env.NODE_ENV === "production" || !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out specific errors that aren't actionable
  beforeSend(event, hint) {
    // Filter out browser extension errors
    const error = hint.originalException as Error;
    if (error?.message) {
      // Ignore common non-actionable errors
      const ignoredErrors = [
        'ResizeObserver loop',
        'ResizeObserver loop completed with undelivered notifications',
        'Script error',
        'Non-Error promise rejection',
        'Loading chunk',
        'ChunkLoadError',
      ];
      
      if (ignoredErrors.some(ignored => error.message.includes(ignored))) {
        return null;
      }
    }
    
    return event;
  },

  // Set environment
  environment: process.env.NODE_ENV,
});

