import { useEffect, useState } from "react";

const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await fetchFunction();
      setData(results);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("An error accured!"));
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setData(undefined);
    setLoading(false);
    setError(null);
  };

  // useFetch.ts
  useEffect(() => {
    if (autoFetch) fetchData();
  }, []); // sadece mount'ta çalışır

  return { data, loading, error, refetch: fetchData, reset };
};
export default useFetch;
