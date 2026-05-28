"use client";

import { useEffect, useState } from "react";
import type { HomeLiveVideoItem, LiveChannelStatus } from "@/models/match";
import { getHomeLiveVideos } from "@/services/matches";

const sortLiveVideosByStartTime = (items: HomeLiveVideoItem[]) =>
  [...items].sort((left, right) => {
    const leftTime = new Date(left.match.startTime || 0).getTime();
    const rightTime = new Date(right.match.startTime || 0).getTime();

    return leftTime - rightTime;
  });

export const useHomeLiveVideos = (params?: {
  categoryName?: string;
  hot?: boolean;
  initialItems?: HomeLiveVideoItem[];
  limit?: number;
  startTimeFrom?: string;
  startTimeTo?: string;
  status?: LiveChannelStatus | "all" | "not_finished";
}) => {
  const [items, setItems] = useState<HomeLiveVideoItem[]>(
    () => sortLiveVideosByStartTime(params?.initialItems || []),
  );
  const [isLoading, setIsLoading] = useState(!params?.initialItems);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const hasInitialItems = Boolean(params?.initialItems);

    if (hasInitialItems) {
      setItems(sortLiveVideosByStartTime(params?.initialItems || []));
      setIsLoading(false);
      setError(null);
      return () => {
        isActive = false;
      };
    }

    async function loadHomeLiveVideos() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getHomeLiveVideos(params);
        if (isActive) {
          setItems(sortLiveVideosByStartTime(response.items));
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load live videos",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadHomeLiveVideos();

    return () => {
      isActive = false;
    };
  }, [
    params?.categoryName,
    params?.hot,
    params?.initialItems,
    params?.limit,
    params?.startTimeFrom,
    params?.startTimeTo,
    params?.status,
  ]);

  return {
    error,
    isLoading,
    items,
  };
};
