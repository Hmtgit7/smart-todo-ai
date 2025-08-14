"use client";

import React from "react";
import { motion } from "framer-motion";
import { TaskList } from "@/components/tasks/TaskList";
import { useTasks } from "@/hooks/useTasks";

export default function TasksPage() {
  const { loading } = useTasks();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={`loading-skeleton-${i}`} className="animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tasks with AI-powered insights and prioritization
          </p>
        </div>
      </div>

      <TaskList />
    </motion.div>
  );
}
