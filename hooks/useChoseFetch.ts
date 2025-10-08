// useContent.ts
import { fetchMovies, fetchSeries } from "@/services/api";
import { useCallback, useEffect } from "react";
import useFetch from "./useFetch";

export const useChoseFetch = (type: "movie" | "tv", query: string = "") => {
  const fetchFn = useCallback(async () => {
    return type === "movie"
      ? await fetchMovies({ query })
      : await fetchSeries({ query });
  }, [type, query]);

  const { data, loading, error, refetch, reset } = useFetch(fetchFn, false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (type || query.trim()) {
        await refetch();
      } else {
        reset();
      }
    }, 500);
    return () => clearTimeout(timeoutId); // sadece type değişince manuel fetch
  }, [type, query]);

  return { data, loading, error };
};
