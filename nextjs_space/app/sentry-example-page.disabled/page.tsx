"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";

export default function SentryExamplePage() {
  const [triggered, setTriggered] = useState(false);

  const triggerError = () => {
    setTriggered(true);
    
    // This will throw an error and send it to Sentry
    throw new Error("Sentry Test Error - This is a test error to verify Sentry integration!");
  };

  const triggerUndefinedFunction = () => {
    setTriggered(true);
    
    // @ts-expect-error - Intentionally calling undefined function
    myUndefinedFunction();
  };

  const triggerSentryCapture = () => {
    setTriggered(true);
    
    // Manually capture an error with Sentry
    Sentry.captureException(new Error("Manual Sentry Capture Test"));
    Sentry.captureMessage("Test message from BookmarkHub!");
    alert("Error sent to Sentry! Check your dashboard.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Sentry Integration Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Options:</h2>
          
          <div className="space-y-4">
            {/* Option 1: Manual capture (safest) */}
            <button
              onClick={triggerSentryCapture}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              ✅ Send Test Error (Safe - No crash)
            </button>
            
            {/* Option 2: Throw error */}
            <button
              onClick={triggerError}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              ⚠️ Throw Error (Will show error boundary)
            </button>
            
            {/* Option 3: Undefined function */}
            <button
              onClick={triggerUndefinedFunction}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              🚨 Call myUndefinedFunction()
            </button>
          </div>
        </div>

        {triggered && (
          <div className="bg-blue-900 border border-blue-500 rounded-lg p-4 mb-6">
            <p className="font-semibold">✅ Error triggered!</p>
            <p className="text-sm mt-2">
              Check your Sentry dashboard at:{" "}
              <a 
                href="https://tbf-inc.sentry.io/issues/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                https://tbf-inc.sentry.io/issues/
              </a>
            </p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Configuration Status:</h2>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>✅ Sentry DSN configured</li>
            <li>✅ Client-side tracking enabled</li>
            <li>✅ Server-side tracking enabled</li>
            <li>✅ Session replay enabled (10% of sessions)</li>
            <li>✅ Performance monitoring enabled</li>
          </ul>
        </div>

        <p className="text-gray-500 text-sm mt-6 text-center">
          You can delete this page after testing: <code>app/sentry-example-page/page.tsx</code>
        </p>
      </div>
    </div>
  );
}

