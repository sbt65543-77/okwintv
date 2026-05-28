import { useMemo } from "react";
import type { TodayMatch } from "@/models/match";
import { getMatchChannelStatus } from "./useTodayMatches";

export function useTodayMatchesList(matches: TodayMatch[]) {
  return useMemo(() => {
    const liveMatches = matches.filter(
      (match) => getMatchChannelStatus(match) === "live",
    );
    const scheduledMatches = matches.filter(
      (match) => getMatchChannelStatus(match) === "scheduled",
    );
    const finishedMatches = matches.filter(
      (match) => getMatchChannelStatus(match) === "finished",
    );

    return {
      finishedMatches,
      hasMatches:
        liveMatches.length ||
        scheduledMatches.length ||
        finishedMatches.length,
      liveMatches,
      scheduledMatches,
    };
  }, [matches]);
}
