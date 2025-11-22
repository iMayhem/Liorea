// src/app/home/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated. The content has been moved to src/app/page.tsx.
// This component now just redirects to the root.
export default function DeprecatedHomePage() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.push('/');
  }, [router]);

  return null;
}
