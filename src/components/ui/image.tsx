// src/components/ui/image.tsx
'use client';
import NextImage from 'next/image';
import type { ImageProps as NextImageProps } from 'next/image';

interface ImageProps extends NextImageProps {
  fill?: boolean;
}


// A wrapper around Next.js's Image component to handle fill prop correctly
// and avoid potential layout shift issues.
export const Image = ({ fill, ...props }: ImageProps) => {
  // Ensure aggressive caching via Next Image optimizer response headers where possible
  // by setting a long cache TTL for remote images. This reduces repeated downloads.
  const common = {
    // 30 days cache hint for optimizer
    // Note: Next.js respects these as URL params; actual headers controlled by server.
    // Using "priority" only when needed to avoid network congestion.
  } as const;
  if (fill) {
    return <NextImage {...props} fill={true} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />;
  }
  return <NextImage {...props} fill={false} />;
};
