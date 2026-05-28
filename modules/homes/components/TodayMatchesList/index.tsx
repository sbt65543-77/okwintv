import type { TodayMatch } from "@/models/match";
import { getEmptyMessage } from "@/helpers/string";
import type { MatchDayKey } from "../../hooks/useTodayMatches";
import { useTodayMatchesList } from "../../hooks/useTodayMatchesList";
import {
  LoadMoreButton,
  MatchCard,
  MatchRow,
  MatchSection,
  MatchTabs,
  SportsSidebar,
  StateMessage,
  VideoSidebar,
} from "./TodayMatchesListParts";

interface TodayMatchesListProps {
  activeDay: MatchDayKey;
  dayCounts: Record<MatchDayKey, number>;
  error: string | null;
  isLoading: boolean;
  matches: TodayMatch[];
  onDayChange: (day: MatchDayKey) => void;
}

export default function TodayMatchesList({
  activeDay,
  dayCounts,
  error,
  isLoading,
  matches,
  onDayChange,
}: TodayMatchesListProps) {
  const { finishedMatches, hasMatches, liveMatches, scheduledMatches } =
    useTodayMatchesList(matches);

  return (
    <section className="bg-[#f4f4f5] px-4 py-6 text-[#303030] sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 lg:grid-cols-[260px_minmax(0,1fr)_275px]">
        <SportsSidebar />

        <div className="min-w-0">
          <MatchTabs
            activeDay={activeDay}
            dayCounts={dayCounts}
            onDayChange={onDayChange}
          />

          {isLoading ? (
            <StateMessage>Đang tải danh sách trận đấu...</StateMessage>
          ) : error ? (
            <StateMessage tone="error">{error}</StateMessage>
          ) : hasMatches ? (
            <div className="grid gap-9">
              {liveMatches.length ? (
                <MatchSection title="Trực tiếp" icon="▮▮">
                  <div className="grid gap-3 xl:grid-cols-2">
                    {liveMatches.map((match) => (
                      <MatchCard key={match._id} match={match} />
                    ))}
                  </div>
                  <LoadMoreButton />
                </MatchSection>
              ) : null}

              {scheduledMatches.length ? (
                <MatchSection title="Sắp diễn ra" icon="⊙">
                  <div className="grid gap-1">
                    {scheduledMatches.map((match) => (
                      <MatchRow key={match._id} match={match} />
                    ))}
                  </div>
                  <LoadMoreButton />
                </MatchSection>
              ) : null}

              {finishedMatches.length ? (
                <MatchSection title="Đã kết thúc" icon="⊙">
                  <div className="grid gap-1">
                    {finishedMatches.map((match) => (
                      <MatchRow key={match._id} match={match} />
                    ))}
                  </div>
                  <LoadMoreButton />
                </MatchSection>
              ) : null}
            </div>
          ) : (
            <StateMessage>{getEmptyMessage(activeDay)}</StateMessage>
          )}
        </div>

        <VideoSidebar />
      </div>
    </section>
  );
}
