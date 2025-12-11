import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface BentoCardProps extends React.ComponentProps<typeof Card> {
    noPadding?: boolean;
}

export const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(({ className, noPadding, children, ...props }, ref) => {
    return (
        <Card
            ref={ref}
            className={cn(
                "bg-[#2B2D31] border-zinc-800 text-zinc-100 shadow-sm rounded-2xl overflow-hidden", // Native Solid styling
                className
            )}
            {...props}
        >
            {children}
        </Card>
    );
});
BentoCard.displayName = "BentoCard";

export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
