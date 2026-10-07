// useChoseFetch.ts
import { fetchMovies, fetchSeries } from "@/services/api";
import { DiscoverMovieFilters, DiscoverTvFilters } from "@/utils/queryBuilder";
import { useCallback, useEffect } from "react";
import useFetch from "./useFetch";

export const useChoseFetch = (
  type: "movie" | "tv",
  query: string = "",
  filters: DiscoverMovieFilters | DiscoverTvFilters | undefined = undefined,
) => {
  const fetchFn = useCallback(async () => {
    return type === "movie"
      ? await fetchMovies({
          query,
          filters: filters as DiscoverMovieFilters | undefined,
        })
      : await fetchSeries({
          query,
          filters: filters as DiscoverTvFilters | undefined,
        });
  }, [type, query, filters]);

  const { data, loading, error, refetch, reset } = useFetch(fetchFn, false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (type || query.trim() || filters) {
        await refetch();
      } else {
        reset();
      }
    }, 500);
    return () => clearTimeout(timeoutId); // sadece type değişince manuel fetch
  }, [type, query, filters]);

  return { data, loading, error };
};
