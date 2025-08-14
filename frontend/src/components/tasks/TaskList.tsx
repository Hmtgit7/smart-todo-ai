"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Search,
  Filter,
  SortAsc,
  Plus,
  Sparkles,
  LayoutGrid,
  List,
} from "lucide-react";
import { Task, TaskFilters } from "@/types";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { sortTasksByPriority, generateStableKey } from "@/lib/utils";

interface TaskListProps {
  initialFilters?: TaskFilters;
  showCreateButton?: boolean;
  showFilters?: boolean;
  viewMode?: "grid" | "list";
  maxItems?: number;
}

export const TaskList = React.memo(function TaskList({
  initialFilters,
  showCreateButton = true,
  showFilters = true,
  viewMode = "grid",
  maxItems,
}: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  const {
    tasks,
    loading,
    filters,
    updateFilters,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    bulkPrioritize,
    enhanceDescription,
  } = useTasks(initialFilters);

  const { categories } = useCategories();

  // Create sensors at the top level
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle search term changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({ search: searchTerm || undefined });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, updateFilters]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    let result = sortTasksByPriority(tasks);
    if (maxItems) {
      result = result.slice(0, maxItems);
    }
    return result;
  }, [tasks, maxItems]);

  // Calculate task stats
  const taskStats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const pending = filteredTasks.filter((t) => t.status === "pending").length;
    const overdue = filteredTasks.filter((t) => t.is_overdue).length;

    return { total, completed, pending, overdue };
  }, [filteredTasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const taskIds = filteredTasks.map((task) => task.id);
      bulkPrioritize(taskIds);
    }
  }, [filteredTasks, bulkPrioritize]);

  const handleTaskSubmit = useCallback(async (taskData: any) => {
    if (selectedTask) {
      return await updateTask(selectedTask.id, taskData);
    } else {
      return await createTask(taskData);
    }
  }, [selectedTask, updateTask, createTask]);

  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setSelectedTask(null);
    setShowTaskForm(false);
  }, []);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setCurrentViewMode(mode);
  }, []);

  const handleBulkPrioritize = useCallback(() => {
    bulkPrioritize(filteredTasks.map((t) => t.id));
  }, [filteredTasks, bulkPrioritize]);

  const handleCreateTask = useCallback(() => {
    setShowTaskForm(true);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    updateFilters({ status: value === "all" ? undefined : value });
  }, [updateFilters]);

  const handlePriorityFilterChange = useCallback((value: string) => {
    updateFilters({ priority: value === "all" ? undefined : value });
  }, [updateFilters]);

  const handleCategoryFilterChange = useCallback((value: string) => {
    updateFilters({ category: value === "all" ? undefined : value });
  }, [updateFilters]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary">{taskStats.total} Total</Badge>
            <Badge
              variant="outline"
              className="text-green-600 border-green-600"
            >
              {taskStats.completed} Completed
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              {taskStats.pending} Pending
            </Badge>
            {taskStats.overdue > 0 && (
              <Badge variant="outline" className="text-red-600 border-red-600">
                {taskStats.overdue} Overdue
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={currentViewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={currentViewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* AI Prioritize */}
          <Button
            variant="outline"
            onClick={handleBulkPrioritize}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Prioritize
          </Button>

          {/* Create Task Button */}
          {showCreateButton && (
            <Button
              onClick={handleCreateTask}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={filters.priority || "all"}
            onValueChange={handlePriorityFilterChange}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={filters.category || "all"}
            onValueChange={handleCategoryFilterChange}
          >
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Task Grid/List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTasks.map((task) => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={
              currentViewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {filteredTasks.map((task, index) => (
              <motion.div
                key={generateStableKey(task)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <TaskCard
                  task={task}
                  onComplete={completeTask}
                  onEdit={handleEditTask}
                  onDelete={deleteTask}
                  onEnhance={enhanceDescription}
                  className={currentViewMode === "list" ? "w-full" : ""}
                />
              </motion.div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {filteredTasks.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <List className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ||
            filters.status ||
            filters.priority ||
            filters.category
              ? "Try adjusting your filters to see more tasks."
              : "Get started by creating your first task!"}
          </p>
          {showCreateButton && (
            <Button onClick={handleCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Task
            </Button>
          )}
        </motion.div>
      )}

      {/* Task Form Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">
            {selectedTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <TaskForm
            task={selectedTask || undefined}
            onSubmit={handleTaskSubmit}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
});
