export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = async (
  error: Error,
  request: Request,
  context: { routerKind: string; routePath: string; routeType: string; revalidateReason?: string }
) => {
  // Only import Sentry when needed
  const Sentry = await import('@sentry/nextjs')
  
  Sentry.captureException(error, {
    extra: {
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      revalidateReason: context.revalidateReason,
      url: request.url,
      method: request.method,
    },
  })
}

