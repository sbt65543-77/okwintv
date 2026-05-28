"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPlatformDayRangeISOString, PLATFORM_TIME_ZONE } from "@/helpers/string";
import type { HomeLiveVideoItem } from "@/models/match";
import { getHomeLiveVideos } from "@/services/matches";

export type ScheduleCategory =
  | "all"
  | "Bóng đá"
  | "Bóng rổ"
  | "Tennis"
  | "Bóng chuyền"
  | "Bóng bàn"
  | "Esports"
  | "Idol live"
  | "Casino";

export type ScheduleDay = {
  dateText: string;
  label: string;
  range: {
    startTimeFrom: string;
    startTimeTo: string;
  };
};

const weekdayLabels = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

const dayLabelFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  timeZone: PLATFORM_TIME_ZONE,
});

const scheduleHotOnlyStorageKey = "schedule.hotOnly";
const schedulePageSize = 20;

const sortScheduleMatchesByStartTime = (items: HomeLiveVideoItem[]) =>
  [...items].sort((left, right) => {
    const leftTime = new Date(left.match.startTime || 0).getTime();
    const rightTime = new Date(right.match.startTime || 0).getTime();

    return leftTime - rightTime;
  });

const mergeUniqueScheduleMatches = (
  currentItems: HomeLiveVideoItem[],
  nextItems: HomeLiveVideoItem[],
) => {
  const itemById = new Map(currentItems.map((item) => [item.id, item]));

  nextItems.forEach((item) => {
    itemById.set(item.id, item);
  });

  return Array.from(itemById.values());
};

export function useScheduleMatches() {
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + index);
        const dateText = dayLabelFormatter.format(targetDate);

        return {
          dateText,
          label:
            index === 0
              ? "Hôm nay"
              : index === 1
                ? "Ngày mai"
                : weekdayLabels[targetDate.getDay()],
          range: getPlatformDayRangeISOString(index),
        };
      }),
    [],
  );
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<ScheduleCategory>("Bóng đá");
  const [hotOnly, setHotOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [matches, setMatches] = useState<HomeLiveVideoItem[]>([]);
  const isRequestingRef = useRef(false);
  const pageRef = useRef(1);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const storedHotOnly = window.localStorage.getItem(scheduleHotOnlyStorageKey);

    if (storedHotOnly === "true") {
      setHotOnly(true);
    } else if (storedHotOnly === "false") {
      setHotOnly(false);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(scheduleHotOnlyStorageKey, String(hotOnly));
  }, [hotOnly]);

  const loadMatches = useCallback(
    async (nextPage = 1, append = false) => {
      if (isRequestingRef.current) {
        return;
      }

      const selectedDay = days[activeDayIndex];
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
        const response = await getHomeLiveVideos({
          ...selectedDay.range,
          categoryName: activeCategory === "all" ? undefined : activeCategory,
          hot: hotOnly || undefined,
          limit: schedulePageSize,
          page: nextPage,
          status: "not_finished",
        });

        if (requestIdRef.current !== requestId) {
          return;
        }

        const responseItems = response.items || [];
        const responseTotal = Number(response.total) || 0;

        setMatches((currentMatches) => {
          const mergedMatches = append
            ? mergeUniqueScheduleMatches(currentMatches, responseItems)
            : responseItems;
          const nextTotal = responseTotal || mergedMatches.length;
          const hasAnotherPage = mergedMatches.length < nextTotal;

          if (append && mergedMatches.length === currentMatches.length) {
            setHasMore(false);
          } else {
            setHasMore(hasAnotherPage);
          }

          return sortScheduleMatchesByStartTime(mergedMatches);
        });
        pageRef.current = nextPage;
      } catch (requestError) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        if (!append) {
          setMatches([]);
          setHasMore(false);
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Không thể tải lịch phát sóng",
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
    [activeCategory, activeDayIndex, days, hotOnly],
  );

  useEffect(() => {
    requestIdRef.current += 1;
    isRequestingRef.current = false;
    pageRef.current = 1;
    setHasMore(false);
    void loadMatches(1);

    return () => {
      requestIdRef.current += 1;
      isRequestingRef.current = false;
    };
  }, [loadMatches]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore || isRequestingRef.current) {
      return;
    }

    void loadMatches(pageRef.current + 1, true);
  }, [hasMore, isLoading, isLoadingMore, loadMatches]);

  return {
    activeCategory,
    activeDayIndex,
    days,
    error,
    hasMore,
    hotOnly,
    isLoading,
    isLoadingMore,
    loadMore,
    matches,
    setActiveCategory,
    setActiveDayIndex,
    setHotOnly,
  };
}
