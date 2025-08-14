"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TrendingUp, BarChart3, PieChartIcon } from "lucide-react";

interface PriorityChartProps {
  data: Record<string, number>;
  className?: string;
  chartType?: "pie" | "bar";
}

const COLORS = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#3b82f6",
  low: "#10b981",
};

const PRIORITY_LABELS = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_DESCRIPTIONS = {
  urgent: "Requires immediate attention",
  high: "Important tasks to complete soon",
  medium: "Standard priority tasks",
  low: "Can be done when time permits",
};

export function PriorityChart({
  data,
  className,
  chartType = "pie",
}: PriorityChartProps) {
  const [currentChartType, setCurrentChartType] = React.useState<"pie" | "bar">(
    chartType
  );

  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS] || key,
      value,
      color: COLORS[key as keyof typeof COLORS] || "#6b7280",
      key,
      percentage: 0, // Will be calculated below
    }));

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  // Calculate percentages
  chartData.forEach((item) => {
    item.percentage = Math.round((item.value / total) * 100);
  });

  if (total === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Priority Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <PieChartIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No tasks to display</p>
              <p className="text-sm">
                Create some tasks to see the priority distribution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{`${data.name}: ${data.value} tasks`}</p>
          <p className="text-sm text-muted-foreground">{`${data.percentage}% of total`}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {
              PRIORITY_DESCRIPTIONS[
                data.key as keyof typeof PRIORITY_DESCRIPTIONS
              ]
            }
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieChart = () => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderBarChart = () => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={currentChartType === "pie" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentChartType("pie")}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={currentChartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentChartType("bar")}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentChartType === "pie" ? renderPieChart() : renderBarChart()}

          {/* Legend with Statistics */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>Priority Breakdown</span>
              <span>Total: {total} tasks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chartData.map((entry) => (
                <motion.div
                  key={entry.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div>
                      <span className="font-medium text-sm">{entry.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {
                          PRIORITY_DESCRIPTIONS[
                            entry.key as keyof typeof PRIORITY_DESCRIPTIONS
                          ]
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{entry.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.percentage}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Priority Insights
              </span>
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              {chartData.find((item) => item.key === "urgent") &&
                chartData.find((item) => item.key === "urgent")!.value > 3 && (
                  <p>
                    • You have{" "}
                    {chartData.find((item) => item.key === "urgent")!.value}{" "}
                    urgent tasks that need immediate attention
                  </p>
                )}
              {chartData.find((item) => item.key === "low") &&
                chartData.find((item) => item.key === "low")!.percentage >
                  50 && (
                  <p>
                    • Most of your tasks are low priority - consider tackling
                    some high-priority items
                  </p>
                )}
              {chartData.find((item) => item.key === "high") &&
                chartData.find((item) => item.key === "high")!.percentage >
                  40 && (
                  <p>
                    • High concentration of high-priority tasks - consider
                    breaking them down
                  </p>
                )}
              {total < 5 && (
                <p>
                  • Light task load - good time to plan ahead or take on new
                  projects
                </p>
              )}
              {total > 20 && (
                <p>
                  • Heavy task load - consider prioritizing and delegating where
                  possible
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
