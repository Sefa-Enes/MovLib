// useContent.ts
import { fetchMovies, fetchSeries } from "@/services/api";
import { useCallback } from "react";
import useFetch from "./useFetch";

export const useChoseFetch = (type: "movie" | "tv", query: string = "") => {
  const fetchFn = useCallback(() => {
    return type === "movie"
      ? fetchMovies({ query: query })
      : fetchSeries({ query: query });
  }, [type]);

  return useFetch(fetchFn);
};
