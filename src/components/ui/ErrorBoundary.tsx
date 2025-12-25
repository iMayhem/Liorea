import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { Button } from "./button";
import { logError, createAppError } from "@/lib/error-handler";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
    onReset?: () => void;
    showResetButton?: boolean;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
    resetCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        resetCount: 0,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, resetCount: 0 };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error with context
        const appError = createAppError(error, this.props.name);
        logError(appError, `ErrorBoundary: ${this.props.name || 'Unknown'}`);

        this.setState({ errorInfo });

        // Call custom error handler if provided
        if (process.env.NODE_ENV === 'development') {
            console.error("Uncaught error:", error, errorInfo);
        }
    }

    private handleReset = () => {
        this.setState(prevState => ({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            resetCount: prevState.resetCount + 1,
        }));

        // Call custom reset handler if provided
        this.props.onReset?.();
    };

    private handleGoHome = () => {
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            const { showResetButton = true } = this.props;
            const errorMessage = this.state.error?.message || 'An unexpected error occurred';

            return (
                <BentoCard className="p-6 border-red-900/50 bg-red-900/10">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-3">
                            <div>
                                <h3 className="font-semibold text-red-500 mb-1">
                                    Something went wrong
                                </h3>
                                <p className="text-sm text-red-400/80">
                                    {this.props.name
                                        ? `The ${this.props.name} encountered an error and couldn't load.`
                                        : "This component encountered an error and couldn't load."}
                                </p>
                            </div>

                            {process.env.NODE_ENV === 'development' && (
                                <details className="text-xs text-red-300/70 bg-red-950/30 p-2 rounded">
                                    <summary className="cursor-pointer font-medium mb-1">
                                        Error Details
                                    </summary>
                                    <pre className="whitespace-pre-wrap break-words mt-2">
                                        {errorMessage}
                                    </pre>
                                    {this.state.errorInfo && (
                                        <pre className="whitespace-pre-wrap break-words mt-2 text-[10px]">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </details>
                            )}

                            {showResetButton && (
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        onClick={this.handleReset}
                                        variant="outline"
                                        size="sm"
                                        className="border-red-700/50 hover:bg-red-900/20 text-red-400"
                                    >
                                        <RefreshCw className="w-3 h-3 mr-1.5" />
                                        Try Again
                                    </Button>
                                    <Button
                                        onClick={this.handleGoHome}
                                        variant="outline"
                                        size="sm"
                                        className="border-red-700/50 hover:bg-red-900/20 text-red-400"
                                    >
                                        <Home className="w-3 h-3 mr-1.5" />
                                        Go Home
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </BentoCard>
            );
        }

        return this.props.children;
    }
}
