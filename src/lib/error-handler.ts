/**
 * Centralized error handling utility
 * Provides error classification, logging, and user-friendly messages
 */

export enum ErrorType {
    NETWORK = 'NETWORK',
    AUTH = 'AUTH',
    VALIDATION = 'VALIDATION',
    FIREBASE = 'FIREBASE',
    API = 'API',
    UNKNOWN = 'UNKNOWN',
}

export interface AppError {
    type: ErrorType;
    message: string;
    originalError?: Error;
    code?: string;
    retryable?: boolean;
    timestamp: number;
}

/**
 * Classify an error into a specific type
 */
export function classifyError(error: unknown): ErrorType {
    if (!error) return ErrorType.UNKNOWN;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = errorMessage.toLowerCase();

    // Network errors
    if (
        errorString.includes('network') ||
        errorString.includes('fetch') ||
        errorString.includes('timeout') ||
        errorString.includes('connection') ||
        errorString.includes('offline')
    ) {
        return ErrorType.NETWORK;
    }

    // Auth errors
    if (
        errorString.includes('auth') ||
        errorString.includes('unauthorized') ||
        errorString.includes('permission') ||
        errorString.includes('token') ||
        errorString.includes('login')
    ) {
        return ErrorType.AUTH;
    }

    // Firebase errors
    if (
        errorString.includes('firebase') ||
        errorString.includes('firestore') ||
        errorString.includes('database')
    ) {
        return ErrorType.FIREBASE;
    }

    // Validation errors
    if (
        errorString.includes('validation') ||
        errorString.includes('invalid') ||
        errorString.includes('required')
    ) {
        return ErrorType.VALIDATION;
    }

    // API errors
    if (
        errorString.includes('api') ||
        errorString.includes('400') ||
        errorString.includes('404') ||
        errorString.includes('500')
    ) {
        return ErrorType.API;
    }

    return ErrorType.UNKNOWN;
}

/**
 * Check if an error is retryable
 */
export function isRetryable(error: unknown): boolean {
    const type = classifyError(error);

    // Network and some API errors are retryable
    if (type === ErrorType.NETWORK) return true;

    // Check for specific HTTP status codes
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('503')) return true;

    // Auth and validation errors are not retryable
    if (type === ErrorType.AUTH || type === ErrorType.VALIDATION) return false;

    return false;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
    const type = classifyError(error);

    const messages: Record<ErrorType, string> = {
        [ErrorType.NETWORK]: 'Unable to connect. Please check your internet connection and try again.',
        [ErrorType.AUTH]: 'Authentication failed. Please log in again.',
        [ErrorType.VALIDATION]: 'Please check your input and try again.',
        [ErrorType.FIREBASE]: 'Database connection issue. Please try again in a moment.',
        [ErrorType.API]: 'Service temporarily unavailable. Please try again later.',
        [ErrorType.UNKNOWN]: 'Something went wrong. Please try again.',
    };

    return messages[type];
}

/**
 * Create a standardized AppError object
 */
export function createAppError(error: unknown, context?: string): AppError {
    const type = classifyError(error);
    const message = getUserFriendlyMessage(error);
    const retryable = isRetryable(error);

    const appError: AppError = {
        type,
        message,
        retryable,
        timestamp: Date.now(),
    };

    if (error instanceof Error) {
        appError.originalError = error;
        // Extract error code if available
        if ('code' in error) {
            appError.code = String(error.code);
        }
    }

    return appError;
}

/**
 * Log error to console (can be extended to send to logging service)
 */
export function logError(error: AppError, context?: string): void {
    const logData = {
        ...error,
        context,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
        console.error('[AppError]', logData);
    }

    // In production, you could send to a logging service like Sentry
    // Example: Sentry.captureException(error.originalError, { extra: logData });
}

/**
 * Handle error with logging and return AppError
 */
export function handleError(error: unknown, context?: string): AppError {
    const appError = createAppError(error, context);
    logError(appError, context);
    return appError;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        initialDelay?: number;
        maxDelay?: number;
        backoffMultiplier?: number;
    } = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        backoffMultiplier = 2,
    } = options;

    let lastError: unknown;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry if error is not retryable
            if (!isRetryable(error)) {
                throw error;
            }

            // Don't retry on last attempt
            if (attempt === maxRetries) {
                throw error;
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));

            // Increase delay for next attempt
            delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
    }

    throw lastError;
}
