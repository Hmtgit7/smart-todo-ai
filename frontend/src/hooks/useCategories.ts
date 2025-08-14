import { useState, useEffect } from "react";
import { Category } from "@/types";
import { categoryAPI } from "@/lib/api";
import { toast } from "sonner";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryAPI.getCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to fetch categories");
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (
    name: string,
    color: string
  ): Promise<Category | null> => {
    try {
      const newCategory = await categoryAPI.createCategory({ name, color });
      setCategories((prev) => [newCategory, ...prev]);
      toast.success("Category created successfully");
      return newCategory;
    } catch (err) {
      toast.error("Failed to create category");
      return null;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
  };
}
