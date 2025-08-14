import { useState, useEffect } from "react";

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  const refetch = () => {
    const execute = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    execute();
  };

  return { data, loading, error, refetch };
}
