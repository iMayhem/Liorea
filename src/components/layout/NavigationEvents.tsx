"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PageLoader from "./PageLoader";

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);
  
  // This is a bit of a hack to detect when a route change starts
  // It relies on the fact that the `a` tag click will happen before the route change
  useEffect(() => {
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
        document.removeEventListener('click', handleLinkClick);
    }
  }, []);


  return loading ? <PageLoader /> : null;
}
