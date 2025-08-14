"use client";

import React, { useEffect, useState } from "react";

interface HydrationFixProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suppressHydrationWarning?: boolean;
}

export function HydrationFix({ 
  children, 
  fallback = null, 
  suppressHydrationWarning = true 
}: HydrationFixProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return (
    <div suppressHydrationWarning={suppressHydrationWarning}>
      {children}
    </div>
  );
}
