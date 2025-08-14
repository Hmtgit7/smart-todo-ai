"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class HydrationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Only handle hydration errors
    if (error.message.includes("Hydration failed") || error.message.includes("hydration")) {
      return { hasError: true, error };
    }
    return { hasError: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Hydration error caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Return fallback or null to prevent the error from propagating
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}
