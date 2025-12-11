"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PageLoader from "./PageLoader";

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This hook now simply sets loading to false when navigation completes.
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const handleStateChange = () => {
      // Check if the URL has actually changed before triggering the loader.
      if (window.location.pathname !== pathname) {
        setLoading(true);
      }
    };

    // Monkey-patch history.pushState to trigger the loader.
    history.pushState = function (...args) {
      handleStateChange();
      return originalPushState.apply(history, args);
    };
    
    // Also handle browser back/forward navigation.
    const handlePopState = () => {
        handleStateChange();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // This handles clicks on Next.js <Link> components.
    const handleLinkClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a');
        if (anchor && anchor.href.startsWith(window.location.origin) && anchor.target !== '_blank') {
            const currentPath = window.location.pathname + window.location.search;
            const newPath = anchor.pathname + anchor.search;
            if(currentPath !== newPath) {
                setLoading(true);
            }
        }
    };
    
    document.addEventListener('click', handleLinkClick);

    return () => {
      // Restore original history methods on cleanup.
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [pathname]);

  return loading ? <PageLoader /> : null;
}