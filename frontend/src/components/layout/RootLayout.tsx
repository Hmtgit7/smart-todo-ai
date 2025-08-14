"use client";

import React, { useState } from "react";
import { Toaster } from "sonner";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";
import { useSuppressHydrationWarning } from "@/hooks/useHydration";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const showSidebar = !pathname?.startsWith("/auth");
  const isMounted = useSuppressHydrationWarning();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 lg:p-6">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="flex">
              <div className="w-64 h-screen bg-gray-200 dark:bg-gray-700 rounded mr-4 hidden lg:block"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

      <div className="flex">
        {/* Desktop Sidebar */}
        {showSidebar && <Sidebar className="hidden lg:block" />}

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        {showSidebar && (
          <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 max-w-[85vw] bg-background border-r z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <Sidebar isMobile={true} onMobileClose={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        <main className={`flex-1 transition-all duration-300 ${showSidebar ? "lg:ml-64" : ""}`}>
          <div className="container mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "glass-card",
        }}
      />
    </div>
  );
}
