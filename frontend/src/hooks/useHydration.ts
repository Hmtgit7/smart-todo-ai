"use client";

import { useEffect, useState } from "react";

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

export function useSuppressHydrationWarning() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Remove browser-generated attributes that can cause hydration mismatches
    const removeBrowserAttributes = () => {
      const elements = document.querySelectorAll('[fdprocessedid]');
      elements.forEach((element) => {
        element.removeAttribute('fdprocessedid');
      });
    };

    // Run immediately and also on any DOM changes
    removeBrowserAttributes();
    
    const observer = new MutationObserver(removeBrowserAttributes);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['fdprocessedid'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return mounted;
}
