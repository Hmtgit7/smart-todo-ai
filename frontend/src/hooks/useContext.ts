import { useState, useEffect, useCallback } from "react";
import { ContextEntry } from "@/types";
import { contextAPI } from "@/lib/api";
import { toast } from "sonner";

export function useContextData(params?: { days?: number; source_type?: string }) {
  const [entries, setEntries] = useState<ContextEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState<any>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contextAPI.getContextEntries(params);
      setEntries(data);
    } catch (err) {
      setError("Failed to fetch context entries");
      toast.error("Failed to load context data");
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createEntry = async (
    content: string,
    sourceType: string
  ): Promise<ContextEntry | null> => {
    try {
      const newEntry = await contextAPI.createContextEntry({
        content,
        source_type: sourceType,
        process_with_ai: true,
      });
      setEntries((prev) => [newEntry, ...prev]);
      toast.success("Context entry added successfully");
      return newEntry;
    } catch (err) {
      toast.error("Failed to add context entry");
      return null;
    }
  };

  const fetchDailySummary = async () => {
    try {
      const summary = await contextAPI.getDailySummary();
      setDailySummary(summary);
    } catch (err) {
      console.error("Failed to fetch daily summary:", err);
    }
  };

  const bulkProcess = async (): Promise<boolean> => {
    try {
      const result = await contextAPI.bulkProcess();
      toast.success(result.message);
      fetchEntries(); // Refresh entries after processing
      return true;
    } catch (err) {
      toast.error("Failed to process context entries");
      return false;
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchDailySummary();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    dailySummary,
    fetchEntries,
    createEntry,
    fetchDailySummary,
    bulkProcess,
  };
}
