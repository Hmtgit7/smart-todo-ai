"use client";

import React from "react";

import { Plus, Sparkles, TrendingUp, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TaskList } from "@/components/tasks/TaskList";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { PriorityChart } from "@/components/dashboard/PriorityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ContextList } from "@/components/context/ContextList";
import { useTasks } from "@/hooks/useTasks";
import { useAsync } from "@/hooks/useAsync";
import { taskAPI } from "@/lib/api";
import { generateStableKey } from "@/lib/utils";

export default function Dashboard() {
  // Use a single tasks hook for all task data
  const { tasks, loading: tasksLoading } = useTasks();
  
  // Get dashboard stats
  const { data: stats, loading: statsLoading } = useAsync(
    () => taskAPI.getDashboardStats(),
    []
  );

  // Filter tasks for different sections - ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL LOGIC
  const upcomingTasks = React.useMemo(() => {
    if (!tasks) return [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      return deadline >= now && deadline <= sevenDaysFromNow;
    }).sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [tasks]);

  const overdueTasks = React.useMemo(() => {
    if (!tasks) return [];
    const now = new Date();
    
    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.deadline) return false;
      return new Date(task.deadline) < now;
    }).sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [tasks]);

  const pendingTasks = React.useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => task.status === 'pending').slice(0, 6);
  }, [tasks]);

  const priorityData = React.useMemo(() => {
    return stats?.priority_distribution || {};
  }, [stats]);

  // Show loading state while data is being fetched
  if (tasksLoading || statsLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-2 w-1/3"></div>
            <div className="h-4 bg-white/20 rounded mb-4 w-2/3"></div>
            <div className="flex gap-3">
              <div className="h-10 bg-white/20 rounded w-32"></div>
              <div className="h-10 bg-white/20 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Loading Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-blue-100 mb-4">
            Here&apos;s what&apos;s happening with your tasks today. Let AI help you stay
            organized.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
            <Button variant="glass" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Insights
            </Button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-4 right-20 w-16 h-16 bg-purple-400/20 rounded-full blur-lg" />
      </div>

      {/* Stats Overview */}
      {stats && <DashboardStats stats={stats} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Tasks */}
        <div className="xl:col-span-2 space-y-6">
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.slice(0, 6).map((task) => (
                    <div
                      key={generateStableKey(task)}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No upcoming tasks
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PriorityChart data={priorityData} />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Today&apos;s Tasks</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {upcomingTasks.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Overdue</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {overdueTasks.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">AI Score</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {stats ? Math.round(stats.completion_rate) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Activity & Context */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <RecentActivity />

          {/* Recent Context */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Context</CardTitle>
            </CardHeader>
            <CardContent>
              <ContextList
                maxItems={5}
                showFilters={false}
                className="space-y-3"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
