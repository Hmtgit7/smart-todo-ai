"use client";

import React from "react";
import {
  Home,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Moon,
  Sun,
  User,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useTheme } from "@/hooks/useTheme";
import { ClientOnly } from "@/components/ui/ClientOnly";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/context", label: "Context", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <ClientOnly>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full gap-4">
            {/* Logo Section */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Todo
              </span>
            </div>

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-1 flex-shrink-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileMenuToggle}
                className="lg:hidden"
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </ClientOnly>
  );
}
