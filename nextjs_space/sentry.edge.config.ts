// This file configures the initialization of Sentry for edge features (Middleware, Edge Routes)
// The config you add here will be used whenever middleware or an edge route handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production (0.1 = 10% is recommended for production)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Only send errors in production, unless SENTRY_DSN is explicitly set
  enabled: process.env.NODE_ENV === "production" || !!process.env.SENTRY_DSN,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Set environment
  environment: process.env.NODE_ENV,
});

