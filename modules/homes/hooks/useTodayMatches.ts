"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPlatformDayRangeISOString } from "@/helpers/string";
import type { TodayMatch } from "@/models/match";
import { getHomeLiveVideos } from "@/services/matches";

export type MatchDayKey = "yesterday" | "today" | "tomorrow";

interface DayRange {
  startTimeFrom: string;
  startTimeTo: string;
}

const dayOffsets: Record<MatchDayKey, number> = {
  yesterday: -1,
  today: 0,
  tomorrow: 1,
};

const buildDayRange = (offset: number): DayRange =>
  getPlatformDayRangeISOString(offset);

const buildInitialDayMatches = (): Record<MatchDayKey, TodayMatch[]> => ({
  yesterday: [],
  today: [],
  tomorrow: [],
});

const buildInitialDayLoading = (): Record<MatchDayKey, boolean> => ({
  yesterday: true,
  today: true,
  tomorrow: true,
});

const buildInitialDayErrors = (): Record<MatchDayKey, string | null> => ({
  yesterday: null,
  today: null,
  tomorrow: null,
});

export const useTodayMatches = () => {
  const dayRanges = useMemo(
    () => ({
      yesterday: buildDayRange(dayOffsets.yesterday),
      today: buildDayRange(dayOffsets.today),
      tomorrow: buildDayRange(dayOffsets.tomorrow),
    }),
    [],
  );
  const [activeDay, setActiveDay] = useState<MatchDayKey>("today");
  const [matchesByDay, setMatchesByDay] = useState(buildInitialDayMatches);
  const [loadingByDay, setLoadingByDay] = useState(buildInitialDayLoading);
  const [errorByDay, setErrorByDay] = useState(buildInitialDayErrors);

  const fetchMatchesByDay = useCallback(
    async (day: MatchDayKey) => {
      setLoadingByDay((current) => ({ ...current, [day]: true }));
      setErrorByDay((current) => ({ ...current, [day]: null }));

      try {
        const data = await getHomeLiveVideos({
          ...dayRanges[day],
          status: "all",
        });
        setMatchesByDay((current) => ({
          ...current,
          [day]: data.items.map(mapHomeLiveVideoToTodayMatch),
        }));
      } catch (requestError) {
        setErrorByDay((current) => ({
          ...current,
          [day]:
            requestError instanceof Error
              ? requestError.message
              : "Failed to load matches",
        }));
      } finally {
        setLoadingByDay((current) => ({ ...current, [day]: false }));
      }
    },
    [dayRanges],
  );

  useEffect(() => {
    let isActive = true;

    async function loadAllMatchDays() {
      const entries = await Promise.all(
        (Object.keys(dayRanges) as MatchDayKey[]).map(async (day) => {
          try {
            const data = await getHomeLiveVideos({
              ...dayRanges[day],
              status: "all",
            });
            return [
              day,
              data.items.map(mapHomeLiveVideoToTodayMatch),
              null,
            ] as const;
          } catch (requestError) {
            return [
              day,
              [],
              requestError instanceof Error
                ? requestError.message
                : "Failed to load matches",
            ] as const;
          }
        }),
      );

      if (!isActive) {
        return;
      }

      setMatchesByDay(
        entries.reduce(
          (result, [day, items]) => ({
            ...result,
            [day]: items,
          }),
          buildInitialDayMatches(),
        ),
      );
      setErrorByDay(
        entries.reduce(
          (result, [day, , error]) => ({
            ...result,
            [day]: error,
          }),
          buildInitialDayErrors(),
        ),
      );
      setLoadingByDay({
        yesterday: false,
        today: false,
        tomorrow: false,
      });
    }

    loadAllMatchDays();

    return () => {
      isActive = false;
    };
  }, [dayRanges]);

  const dayCounts = {
    yesterday: matchesByDay.yesterday.length,
    today: matchesByDay.today.length,
    tomorrow: matchesByDay.tomorrow.length,
  };
  const liveMatches = [
    ...matchesByDay.yesterday,
    ...matchesByDay.today,
    ...matchesByDay.tomorrow,
  ].filter((match) => getMatchChannelStatus(match) === "live");

  return {
    activeDay,
    dayCounts,
    error: errorByDay[activeDay],
    isLoading: loadingByDay[activeDay],
    liveMatches,
    matches: matchesByDay[activeDay],
    refetch: () => fetchMatchesByDay(activeDay),
    setActiveDay,
  };
};

function mapHomeLiveVideoToTodayMatch(
  item: Awaited<ReturnType<typeof getHomeLiveVideos>>["items"][number],
): TodayMatch {
  return {
    ...item.match,
    channelId: item.channel._id,
    channelStatus: item.channel.status || "scheduled",
  };
}

export function getMatchChannelStatus(match: TodayMatch) {
  return match.channelStatus || "scheduled";
}
