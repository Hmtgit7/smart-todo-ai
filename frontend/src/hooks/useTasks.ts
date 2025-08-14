import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Task, TaskFilters, CreateTaskData } from "@/types";
import { taskAPI } from "@/lib/api";
import { toast } from "sonner";

export function useTasks(initialFilters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {});
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [filters]);

  const fetchTasks = useCallback(async (currentFilters?: TaskFilters) => {
    try {
      setLoading(true);
      setError(null);
      const filtersToUse = currentFilters || memoizedFilters;
      const data = await taskAPI.getTasks(filtersToUse);
      
      // Filter out any tasks that don't have an ID
      const validTasks = Array.isArray(data) ? data.filter(task => task && task.id !== undefined && task.id !== null) : [];
      setTasks(validTasks);
    } catch (err) {
      setError("Failed to fetch tasks");
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  // Debounced refresh to prevent rapid API calls
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      fetchTasks();
    }, 300);
  }, [fetchTasks]);

  // Memoize tasks to prevent unnecessary re-renders
  const memoizedTasks = useMemo(() => tasks, [tasks]);

  const createTask = useCallback(async (taskData: CreateTaskData): Promise<Task | null> => {
    try {
      const newTask = await taskAPI.createTask(taskData);
      
      // Ensure the task has all required fields
      if (!newTask.id) {
        console.error("Task created but missing ID:", newTask);
        toast.error("Task created but missing required data");
        return null;
      }
      
      setTasks((prev) => [newTask, ...prev]);
      toast.success("Task created successfully");
      return newTask;
    } catch (err) {
      toast.error("Failed to create task");
      return null;
    }
  }, []);

  const updateTask = useCallback(async (
    id: number,
    updates: Partial<CreateTaskData>
  ): Promise<Task | null> => {
    try {
      const updatedTask = await taskAPI.updateTask(id, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      toast.success("Task updated successfully");
      return updatedTask;
    } catch (err) {
      toast.error("Failed to update task");
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      await taskAPI.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success("Task deleted successfully");
      return true;
    } catch (err) {
      toast.error("Failed to delete task");
      return false;
    }
  }, []);

  const completeTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      const completedTask = await taskAPI.completeTask(id);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? completedTask : task))
      );
      toast.success("Task completed!");
      return true;
    } catch (err) {
      toast.error("Failed to complete task");
      return false;
    }
  }, []);

  const bulkPrioritize = useCallback(async (taskIds: number[]): Promise<boolean> => {
    try {
      const result = await taskAPI.bulkPrioritize(taskIds);
      setTasks((prev) =>
        prev.map((task) => {
          const updatedTask = result.tasks.find((t) => t.id === task.id);
          return updatedTask || task;
        })
      );
      toast.success(result.message);
      return true;
    } catch (err) {
      toast.error("Failed to prioritize tasks");
      return false;
    }
  }, []);

  const enhanceDescription = useCallback(async (id: number): Promise<boolean> => {
    try {
      const enhancedTask = await taskAPI.enhanceDescription(id);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? enhancedTask : task))
      );
      toast.success("Task description enhanced with AI");
      return true;
    } catch (err) {
      toast.error("Failed to enhance task description");
      return false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!isInitializedRef.current) {
      fetchTasks();
      isInitializedRef.current = true;
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchTasks]);

  // Handle filter changes
  useEffect(() => {
    if (isInitializedRef.current) {
      debouncedRefresh();
    }
  }, [memoizedFilters, debouncedRefresh]);

  const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    tasks: memoizedTasks,
    loading,
    error,
    filters: memoizedFilters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    bulkPrioritize,
    enhanceDescription,
    updateFilters,
  };
}
