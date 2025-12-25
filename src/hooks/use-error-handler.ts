import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { handleError, AppError, retryWithBackoff } from '@/lib/error-handler';

interface UseErrorHandlerOptions {
    showToast?: boolean;
    context?: string;
}

interface UseErrorHandlerReturn {
    error: AppError | null;
    isError: boolean;
    handleError: (error: unknown) => AppError;
    clearError: () => void;
    executeWithErrorHandling: <T>(
        fn: () => Promise<T>,
        options?: { retry?: boolean; onError?: (error: AppError) => void }
    ) => Promise<T | null>;
}

/**
 * Custom hook for consistent error handling across the application
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
    const { showToast = true, context } = options;
    const { toast } = useToast();
    const [error, setError] = useState<AppError | null>(null);

    const handleErrorCallback = useCallback(
        (err: unknown): AppError => {
            const appError = handleError(err, context);
            setError(appError);

            if (showToast) {
                toast({
                    variant: 'destructive',
                    title: appError.retryable ? 'Temporary Error' : 'Error',
                    description: appError.message,
                });
            }

            return appError;
        },
        [context, showToast, toast]
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const executeWithErrorHandling = useCallback(
        async <T,>(
            fn: () => Promise<T>,
            executeOptions?: { retry?: boolean; onError?: (error: AppError) => void }
        ): Promise<T | null> => {
            const { retry = false, onError } = executeOptions || {};

            try {
                clearError();

                if (retry) {
                    return await retryWithBackoff(fn);
                } else {
                    return await fn();
                }
            } catch (err) {
                const appError = handleErrorCallback(err);
                onError?.(appError);
                return null;
            }
        },
        [handleErrorCallback, clearError]
    );

    return {
        error,
        isError: error !== null,
        handleError: handleErrorCallback,
        clearError,
        executeWithErrorHandling,
    };
}
