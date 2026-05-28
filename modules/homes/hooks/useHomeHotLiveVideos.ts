"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeLiveVideoItem } from "@/models/match";
import { getHomeHotLiveVideos, getHomeLiveVideos } from "@/services/matches";

const categoryPageSize = 15;

const sortLiveVideosByStartTime = (items: HomeLiveVideoItem[]) =>
  [...items].sort((left, right) => {
    const leftTime = new Date(left.match.startTime || 0).getTime();
    const rightTime = new Date(right.match.startTime || 0).getTime();

    return leftTime - rightTime;
  });

const filterLiveAndScheduledVideos = (items: HomeLiveVideoItem[]) =>
  items.filter((item) => {
    const status = item.channel.status || "scheduled";

    return status === "live" || status === "scheduled";
  });

const mergeUniqueLiveVideos = (
  currentItems: HomeLiveVideoItem[],
  nextItems: HomeLiveVideoItem[],
) => {
  const itemById = new Map(currentItems.map((item) => [item.id, item]));

  nextItems.forEach((item) => {
    itemById.set(item.id, item);
  });

  return Array.from(itemById.values());
};

export const useHomeHotLiveVideos = (params?: {
  categoryName?: string;
  initialItems?: HomeLiveVideoItem[];
}) => {
  const categoryName = params?.categoryName;
  const initialItems = categoryName ? [] : params?.initialItems || [];
  const [items, setItems] = useState<HomeLiveVideoItem[]>(
    () => sortLiveVideosByStartTime(initialItems),
  );
  const [isLoading, setIsLoading] = useState(!initialItems.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const isRequestingRef = useRef(false);
  const pageRef = useRef(1);
  const requestIdRef = useRef(0);

  const loadHomeHotLiveVideos = useCallback(
    async (nextPage = 1, append = false) => {
      if (isRequestingRef.current) {
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      isRequestingRef.current = true;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = categoryName
          ? await getHomeLiveVideos({
              categoryName,
              hot: false,
              limit: categoryPageSize,
              page: nextPage,
              status: "not_finished",
            })
          : await getHomeHotLiveVideos({
              status: "live",
            });
        const responseItems = response.items || [];
        const nextItems = categoryName
          ? filterLiveAndScheduledVideos(responseItems)
          : responseItems;
        const responseTotal = Number(response.total) || 0;

        if (requestIdRef.current !== requestId) {
          return;
        }

        setItems((currentItems) => {
          const mergedItems = append
            ? mergeUniqueLiveVideos(currentItems, nextItems)
            : nextItems;
          const nextTotal = responseTotal || mergedItems.length;
          const hasAnotherCategoryPage =
            Boolean(categoryName) && mergedItems.length < nextTotal;

          if (append && mergedItems.length === currentItems.length) {
            setHasMore(false);
          } else {
            setHasMore(hasAnotherCategoryPage);
          }

          return sortLiveVideosByStartTime(mergedItems);
        });
        pageRef.current = nextPage;
        if (!categoryName) {
          setHasMore(false);
        }
      } catch (requestError) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load hot live videos",
        );
      } finally {
        if (requestIdRef.current !== requestId) {
          return;
        }

        isRequestingRef.current = false;

        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [categoryName],
  );

  useEffect(() => {
    requestIdRef.current += 1;
    isRequestingRef.current = false;
    pageRef.current = 1;
    const requestVersion = requestIdRef.current;
    const timeoutId = window.setTimeout(() => {
      if (requestIdRef.current === requestVersion) {
        void loadHomeHotLiveVideos(1);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
      isRequestingRef.current = false;
    };
  }, [loadHomeHotLiveVideos]);

  const loadMore = useCallback(() => {
    if (
      !categoryName ||
      !hasMore ||
      isLoading ||
      isLoadingMore ||
      isRequestingRef.current
    ) {
      return;
    }

    void loadHomeHotLiveVideos(pageRef.current + 1, true);
  }, [
    categoryName,
    hasMore,
    isLoading,
    isLoadingMore,
    loadHomeHotLiveVideos,
  ]);

  return {
    error,
    hasMore: Boolean(categoryName) && hasMore,
    isLoading,
    isLoadingMore,
    items,
    loadMore,
  };
};
