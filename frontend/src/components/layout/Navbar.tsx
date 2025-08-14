"use client";

import React from "react";
import {
  Home,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Settings,
  Moon,
  Sun,
  User,
  Bell,
  Search,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
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
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
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

            {/* Search Bar - Hidden on mobile and tablet */}
            <div className="hidden xl:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, context..."
                  className="pl-10 glass"
                />
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Quick Add Task - Hidden on mobile */}
              <Button size="sm" className="hidden sm:flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Quick Add
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
                  <DropdownMenuItem>Help</DropdownMenuItem>
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
