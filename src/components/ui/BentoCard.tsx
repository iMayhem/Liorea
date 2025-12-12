import { cn } from "@/lib/utils";
import React from "react";

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function BentoCard({ children, className, noPadding = false }: BentoCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow",
                !noPadding && "p-6",
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col space-y-1.5 p-6", className)}
            {...props}
        />
    );
}

export function CardTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "font-semibold leading-none tracking-tight",
                className
            )}
            {...props}
        />
    );
}

export function CardContent({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-6 pt-0", className)} {...props} />;
}
