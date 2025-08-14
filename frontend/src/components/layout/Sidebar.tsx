"use client";

import React from "react";
import {
  Home,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Settings,
  Calendar,
  Tag,
  Clock,
  TrendingUp,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { ClientOnly } from "@/components/ui/ClientOnly";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/context", label: "Context", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const quickFilters = [
  { label: "Today", icon: Calendar, filter: "today" },
  { label: "Overdue", icon: Clock, filter: "overdue" },
  { label: "High Priority", icon: TrendingUp, filter: "high" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { tasks } = useTasks();
  const { categories } = useCategories();

  const taskCounts = React.useMemo(() => {
    const total = tasks.length;
    const today = tasks.filter((t) => {
      if (!t.deadline) return false;
      const deadline = new Date(t.deadline);
      const today = new Date();
      return deadline.toDateString() === today.toDateString();
    }).length;
    const overdue = tasks.filter((t) => t.is_overdue).length;
    const high = tasks.filter(
      (t) => t.priority === "high" || t.priority === "urgent"
    ).length;

    return { total, today, overdue, high };
  }, [tasks]);

  return (
    <ClientOnly>
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-y-auto ${className}`}>
        <div className="p-4 space-y-6">
          {/* Navigation */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </h3>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      isActive ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Filters
            </h3>
            {quickFilters.map((filter) => {
              const count = taskCounts[filter.filter as keyof typeof taskCounts];
              return (
                <Link key={filter.filter} href={`/tasks?filter=${filter.filter}`}>
                  <Button variant="ghost" className="w-full justify-between">
                    <div className="flex items-center gap-3">
                      <filter.icon className="w-4 h-4" />
                      {filter.label}
                    </div>
                    {count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Categories
            </h3>
            {categories.slice(0, 6).map((category) => (
              <Link key={category.id} href={`/tasks?category=${category.id}`}>
                <Button variant="ghost" className="w-full justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.task_count}
                  </Badge>
                </Button>
              </Link>
            ))}
            {categories.length > 6 && (
              <Link href="/categories">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground"
                >
                  <Tag className="w-4 h-4" />
                  View all categories
                </Button>
              </Link>
            )}
          </div>

          {/* AI Insights Card */}
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium">AI Insights</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              You have {taskCounts.high} high-priority tasks. Consider using AI
              prioritization to optimize your workflow.
            </p>
            <Button size="sm" variant="outline" className="w-full text-xs">
              Get AI Suggestions
            </Button>
          </Card>
        </div>
      </aside>
    </ClientOnly>
  );
}
