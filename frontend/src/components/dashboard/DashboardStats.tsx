"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { DashboardStats as StatsType } from "@/types";

interface DashboardStatsProps {
  stats: StatsType;
  className?: string;
}

export function DashboardStats({ stats, className }: DashboardStatsProps) {
  const statsCards = [
    {
      title: "Total Tasks",
      value: stats.total_tasks,
      icon: Target,
      color: "blue",
      trend: "+12% from last week",
    },
    {
      title: "Completed",
      value: stats.completed_tasks,
      icon: CheckCircle,
      color: "green",
      trend: `${stats.completion_rate}% completion rate`,
    },
    {
      title: "Pending",
      value: stats.pending_tasks,
      icon: Clock,
      color: "yellow",
      trend: "On track",
    },
    {
      title: "Overdue",
      value: stats.overdue_tasks,
      icon: AlertTriangle,
      color: "red",
      trend: stats.overdue_tasks > 0 ? "Needs attention" : "All good!",
    },
  ];

  const colorClasses = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-100 dark:bg-green-900/20",
    yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
    red: "text-red-600 bg-red-100 dark:bg-red-900/20",
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 rounded-full ${
                  colorClasses[stat.color as keyof typeof colorClasses]
                }`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>

              {/* Progress bar for completion */}
              {stat.title === "Completed" && stats.total_tasks > 0 && (
                <div className="mt-3">
                  <Progress value={stats.completion_rate} className="h-2" />
                </div>
              )}
            </CardContent>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
