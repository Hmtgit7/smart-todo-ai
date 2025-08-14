"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { PriorityChart } from "@/components/dashboard/PriorityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useAsync } from "@/hooks/useAsync";
import { taskAPI, contextAPI } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

// Mock data for charts
const taskCompletionData = [
  { date: "2024-01", completed: 12, created: 15 },
  { date: "2024-02", completed: 18, created: 20 },
  { date: "2024-03", completed: 25, created: 28 },
  { date: "2024-04", completed: 32, created: 35 },
  { date: "2024-05", completed: 28, created: 30 },
  { date: "2024-06", completed: 35, created: 38 },
];

const productivityData = [
  { day: "Mon", score: 85 },
  { day: "Tue", score: 92 },
  { day: "Wed", score: 78 },
  { day: "Thu", score: 95 },
  { day: "Fri", score: 88 },
  { day: "Sat", score: 70 },
  { day: "Sun", score: 65 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const { data: stats } = useAsync(() => taskAPI.getDashboardStats(), []);
  const { data: contextAnalytics } = useAsync(
    () => contextAPI.getAnalytics(30),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Insights into your productivity and task management patterns
          </p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Completion Rate",
            value: `${stats?.completion_rate || 0}%`,
            change: "+5.2%",
            icon: Target,
            color: "green",
          },
          {
            title: "Avg. Daily Tasks",
            value: "8.5",
            change: "+12%",
            icon: BarChart3,
            color: "blue",
          },
          {
            title: "Productivity Score",
            value: "87",
            change: "+3.1%",
            icon: TrendingUp,
            color: "purple",
          },
          {
            title: "Focus Time",
            value: "5.2h",
            change: "+8%",
            icon: Clock,
            color: "orange",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p
                      className={`text-sm ${
                        metric.change.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {metric.change} from last period
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}
                  >
                    <metric.icon
                      className={`h-6 w-6 text-${metric.color}-600`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Task Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Productivity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Productivity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        {stats && <PriorityChart data={stats.priority_distribution} />}

        {/* Context Analytics */}
        {contextAnalytics && (
          <Card>
            <CardHeader>
              <CardTitle>Context Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(contextAnalytics.source_distribution).map(
                  ([source, count]) => (
                    <div
                      key={source}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full" />
                        <span className="capitalize">{source}</span>
                      </div>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.category_distribution.slice(0, 5).map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {category.count} tasks
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
