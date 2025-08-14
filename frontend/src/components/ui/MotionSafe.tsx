"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MotionSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function MotionSafe({ children, fallback = null }: MotionSafeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Safe motion components that only render on client
export const SafeMotion = {
  div: ({ children, ...props }: any) => (
    <MotionSafe>
      <motion.div {...props}>{children}</motion.div>
    </MotionSafe>
  ),
  span: ({ children, ...props }: any) => (
    <MotionSafe>
      <motion.span {...props}>{children}</motion.span>
    </MotionSafe>
  ),
  AnimatePresence: ({ children, ...props }: any) => (
    <MotionSafe>
      <AnimatePresence {...props}>{children}</AnimatePresence>
    </MotionSafe>
  ),
};
