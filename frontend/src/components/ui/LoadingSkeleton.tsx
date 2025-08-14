import React from "react";
import { Skeleton } from "./Skeleton";

interface LoadingSkeletonProps {
  type?: "card" | "list" | "chart" | "table";
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({
  type = "card",
  rows = 3,
  className,
}: LoadingSkeletonProps) {
  if (type === "card") {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-[60px]" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className={`border rounded-lg p-4 ${className}`}>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={`border rounded-lg ${className}`}>
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-[200px]" />
        </div>
        <div className="divide-y">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="p-4 flex space-x-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
