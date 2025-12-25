"use client";

import React from 'react';
import { BentoCard } from '@/components/ui/BentoCard';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProviderErrorFallbackProps {
    providerName: string;
    error?: Error;
    onRetry?: () => void;
}

/**
 * Specialized fallback UI for provider failures
 * Allows partial app functionality when a provider fails
 */
export default function ProviderErrorFallback({
    providerName,
    error,
    onRetry
}: ProviderErrorFallbackProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <BentoCard className="max-w-md p-6 border-amber-900/50 bg-amber-900/10">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="font-semibold text-amber-500 mb-1">
                                Service Temporarily Unavailable
                            </h3>
                            <p className="text-sm text-amber-400/80">
                                The {providerName} service encountered an error. Some features may be limited.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && error && (
                            <details className="text-xs text-amber-300/70 bg-amber-950/30 p-2 rounded">
                                <summary className="cursor-pointer font-medium mb-1">
                                    Error Details
                                </summary>
                                <pre className="whitespace-pre-wrap break-words mt-2">
                                    {error.message}
                                </pre>
                            </details>
                        )}

                        {onRetry && (
                            <Button
                                onClick={onRetry}
                                variant="outline"
                                size="sm"
                                className="border-amber-700/50 hover:bg-amber-900/20 text-amber-400"
                            >
                                <RefreshCw className="w-3 h-3 mr-1.5" />
                                Retry
                            </Button>
                        )}
                    </div>
                </div>
            </BentoCard>
        </div>
    );
}
