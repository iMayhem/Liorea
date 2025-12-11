import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { BentoCard } from "./BentoCard";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <BentoCard className="p-4 border-red-900/50 bg-red-900/10">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <h3 className="font-semibold">Something went wrong</h3>
                    </div>
                    <p className="text-sm text-red-400/80">
                        {this.props.name ? `The ${this.props.name} failed to load.` : "This component failed to load."}
                    </p>
                </BentoCard>
            );
        }

        return this.props.children;
    }
}
