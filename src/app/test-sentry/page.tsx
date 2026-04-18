'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';

export default function TestSentryPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const testErrorBoundary = () => {
    addResult('🧪 Testing ErrorBoundary...');
    // This will be caught by ErrorBoundary
    throw new Error('Test error from ErrorBoundary - This should be caught!');
  };

  const testManualCapture = () => {
    addResult('🧪 Testing manual error capture...');
    try {
      throw new Error('Test manual error - Sent directly to Sentry');
    } catch (error) {
      Sentry.captureException(error);
      addResult('✅ Error sent to Sentry manually');
    }
  };

  const testWithContext = () => {
    addResult('🧪 Testing error with context...');
    Sentry.captureException(new Error('Test error with user context'), {
      tags: {
        test_type: 'sentry_verification',
        environment: 'production',
      },
      user: {
        email: 'test@worthapply.com',
        id: 'test-user-123',
      },
      extra: {
        test_timestamp: new Date().toISOString(),
        page: 'test-sentry',
      },
    });
    addResult('✅ Error with context sent to Sentry');
  };

  const testPerformance = () => {
    addResult('🧪 Testing performance tracking...');
    
    // Modern Sentry spans API
    Sentry.startSpan(
      {
        name: 'Test Performance',
        op: 'test',
      },
      () => {
        // Simulate some work
        const start = Date.now();
        while (Date.now() - start < 100) {
          // Wait 100ms
        }
        addResult('✅ Performance span sent to Sentry');
      }
    );
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-secondary hover:underline mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold text-on-surface mb-2">
            🧪 Sentry Test Page
          </h1>
          <p className="text-on-surface/70">
            Test all Sentry integrations to verify error tracking is working
          </p>
        </div>

        {/* Warning */}
        <div className="bg-error/10 border border-error/30 rounded-xl p-6 mb-8">
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-on-surface mb-1">Test Page Only</h3>
              <p className="text-sm text-on-surface/70">
                This page will send test errors to Sentry. Delete this page after verification.
              </p>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant/10 p-8 mb-8">
          <h2 className="text-xl font-semibold text-on-surface mb-6">
            Run Sentry Tests
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testManualCapture}
              className="p-6 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-bold mb-1">Manual Error Capture</div>
              <div className="text-sm opacity-90">
                Send error directly to Sentry
              </div>
            </button>

            <button
              onClick={testWithContext}
              className="p-6 bg-secondary text-on-secondary rounded-xl font-semibold hover:bg-secondary/90 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-bold mb-1">Error with Context</div>
              <div className="text-sm opacity-90">
                Send error with user data and tags
              </div>
            </button>

            <button
              onClick={testPerformance}
              className="p-6 bg-tertiary text-on-tertiary rounded-xl font-semibold hover:bg-tertiary/90 transition-colors text-left"
            >
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-bold mb-1">Performance Tracking</div>
              <div className="text-sm opacity-90">
                Send performance transaction
              </div>
            </button>

            <button
              onClick={testErrorBoundary}
              className="p-6 bg-error text-on-error rounded-xl font-semibold hover:bg-error/90 transition-colors text-left"
            >
              <div className="text-2xl mb-2">💥</div>
              <div className="font-bold mb-1">Trigger Error Boundary</div>
              <div className="text-sm opacity-90">
                This will crash the page (caught by ErrorBoundary)
              </div>
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-surface-container rounded-2xl border border-outline-variant/10 p-8">
            <h2 className="text-xl font-semibold text-on-surface mb-4">
              Test Results
            </h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 bg-surface rounded-lg text-sm font-mono text-on-surface"
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant/10 p-8 mt-8">
          <h2 className="text-xl font-semibold text-on-surface mb-4">
            How to Verify
          </h2>
          <ol className="space-y-3 text-on-surface/80">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>Open your Sentry dashboard at <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">sentry.io</a></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>Click one of the test buttons above</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>Wait 10-30 seconds for the error to appear in Sentry</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <span>Verify the error contains:</span>
            </li>
            <ul className="ml-12 space-y-2 text-sm mt-2">
              <li>✅ Error message and stack trace</li>
              <li>✅ User context (if applicable)</li>
              <li>✅ Tags and extra data</li>
              <li>✅ Source maps (readable code, not minified)</li>
            </ul>
            <li className="flex gap-3">
              <span className="font-bold text-primary">5.</span>
              <span>Delete this test page: <code className="text-sm bg-surface px-2 py-1 rounded">rm src/app/test-sentry/page.tsx</code></span>
            </li>
          </ol>
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-6 bg-primary/10 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-on-surface mb-3">📚 Quick Links</h3>
          <div className="space-y-2 text-sm">
            <div>
              <a 
                href="https://sentry.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                → Sentry Dashboard
              </a>
            </div>
            <div>
              <a 
                href="https://docs.sentry.io/platforms/javascript/guides/nextjs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                → Sentry Next.js Docs
              </a>
            </div>
            <div>
              <Link href="/" className="text-secondary hover:underline">
                → Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
