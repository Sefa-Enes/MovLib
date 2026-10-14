// hooks/useInfiniteFetch.ts
//
// Generic infinite-scroll (pagination) hook for TMDB-style APIs.
//
// The backend TMDB proxy passes the `page` query param through untouched and
// returns the standard TMDB envelope:
//   { page, results: [...], total_pages, total_results }
//
// The hook fetches page 1 on mount (and whenever `deps` change), then
// `loadMore()` appends subsequent pages — deduped by item `id` — until
// `hasMore` is false. Concurrent loads are guarded, so spamming `loadMore`
// (e.g. from onEndReached / onScroll) is safe.

import { useCallback, useEffect, useRef, useState } from "react";

export interface PageResult<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results?: number;
}

export function useInfiniteFetch<T>(
  fetchPage: (page: number) => Promise<PageResult<T>>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState<number | undefined>(
    undefined,
  );

  // Refs avoid stale closures and guard against concurrent page loads.
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const busyRef = useRef(false);
  const pageRef = useRef(1);
  const genRef = useRef(0);

  // hooks/useInfiniteFetch.ts — replace loadMore
  const loadMore = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    const gen = genRef.current;
    setLoadingMore(true);
    try {
      const next = pageRef.current + 1;
      const res = await fetchRef.current(next);
      if (gen !== genRef.current) return;
      pageRef.current = res.page ?? next;
      setPage(pageRef.current);
      setData((prev) => {
        const seen = new Set(prev.map((x) => (x as { id?: unknown }).id));
        const fresh = (res.results ?? []).filter(
          (x) => !seen.has((x as { id?: unknown }).id),
        );
        return [...prev, ...fresh];
      });
      setHasMore(pageRef.current < (res.total_pages ?? 1));
      setTotalResults(res.total_results);
    } catch (e) {
      if (gen === genRef.current) {
        setError(e instanceof Error ? e : new Error("Failed to load more"));
      }
    } finally {
      if (gen === genRef.current) {
        busyRef.current = false;
        setLoadingMore(false);
      }
    }
  }, []);

  // Reload page 1 without blanking the list (pull-to-refresh).
  const refetch = useCallback(async () => {
    const gen = ++genRef.current;
    busyRef.current = true;
    try {
      const res = await fetchRef.current(1);
      if (gen !== genRef.current) return;
      pageRef.current = res.page ?? 1;
      setPage(pageRef.current);
      setData(res.results ?? []);
      setHasMore(pageRef.current < (res.total_pages ?? 1));
      setTotalResults(res.total_results);
      setError(null);
    } catch (e) {
      if (gen === genRef.current) {
        setError(e instanceof Error ? e : new Error("Failed to load"));
      }
    } finally {
      if (gen === genRef.current) busyRef.current = false;
    }
  }, []);
  // Initial load + reload whenever the query/filters/content type change.
  useEffect(() => {
    let cancelled = false;
    genRef.current += 1;
    setLoadingMore(false);
    busyRef.current = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetchRef.current(1);
        if (cancelled) return;
        pageRef.current = res.page ?? 1;
        setPage(pageRef.current);
        setData(res.results ?? []);
        setHasMore(pageRef.current < (res.total_pages ?? 1));
        setTotalResults(res.total_results);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error("Failed to load"));
        }
      } finally {
        if (!cancelled) {
          busyRef.current = false;
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      busyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reset = useCallback(() => {
    busyRef.current = false;
    pageRef.current = 1;
    setData([]);
    setPage(1);
    setHasMore(false);
    setTotalResults(undefined);
    setError(null);
    setLoading(true);
  }, []);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    page,
    totalResults,
    loadMore,
    refetch,
    reset,
  };
}

export default useInfiniteFetch;
