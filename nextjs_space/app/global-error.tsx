"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error("Global error caught:", error)
    
    // Note: Sentry integration has been disabled to avoid build warnings.
    // To enable Sentry, configure SENTRY_DSN in .env and uncomment the code below.
    
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   import("@sentry/nextjs").then((Sentry) => {
    //     Sentry.captureException(error)
    //   }).catch((err) => {
    //     console.error("Failed to load Sentry:", err)
    //   })
    // }
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Something went wrong!
              </h1>
              <p className="text-gray-600 mb-8">
                We&apos;ve been notified about this issue and are working to fix it.
              </p>
              {error.digest && (
                <p className="text-sm text-gray-500 mb-4">
                  Error ID: {error.digest}
                </p>
              )}
              <Button onClick={reset} className="w-full">
                Try again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

