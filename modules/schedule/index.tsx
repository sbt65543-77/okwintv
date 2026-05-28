"use client";

import { useEffect, useRef } from "react";
import HomeSidebar from "@/modules/homes/components/HomeSidebar";
import { useScheduleMatches } from "./hooks/useScheduleMatches";
import {
  ScheduleCategoryFilters,
  ScheduleDateTabs,
  ScheduleGrid,
  ScheduleHeader,
  ScheduleState,
} from "./components/ScheduleParts";

export default function SchedulePage({
  customerSupportUrl,
}: {
  customerSupportUrl?: string;
}) {
  const {
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
  } = useScheduleMatches();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadMoreNode = loadMoreRef.current;

    if (!loadMoreNode || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(loadMoreNode);

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  return (
    <main className="min-h-screen bg-black text-white sm:bg-[#111]">
      <div className="mx-auto grid max-w-[1920px] grid-cols-1 pt-[50px] sm:pt-[60px] 2xl:grid-cols-[250px_minmax(0,1fr)]">
        <div className="hidden 2xl:block">
          <HomeSidebar customerSupportUrl={customerSupportUrl} />
        </div>
        <section className="min-h-[calc(100vh-50px)] min-w-0 bg-black pb-5 pt-3 sm:min-h-[calc(100vh-60px)] sm:pt-[30px]">
          <div className="mx-auto w-full px-2 sm:px-5 md:px-8 xl:px-[80px] 2xl:px-[125px]">
            <div className="overflow-visible rounded-none bg-black shadow-none sm:overflow-hidden sm:rounded-b-[6px] sm:bg-[#282828] sm:shadow-[0_10px_28px_rgba(0,0,0,.38)]">
              <ScheduleHeader />
              <div className="px-2.5 pb-[18px] pt-[16px] sm:px-5">
                <ScheduleDateTabs
                  activeDayIndex={activeDayIndex}
                  days={days}
                  onChange={setActiveDayIndex}
                />
                <ScheduleCategoryFilters
                  activeCategory={activeCategory}
                  hotOnly={hotOnly}
                  onCategoryChange={setActiveCategory}
                  onHotChange={setHotOnly}
                />
              </div>
            </div>

            <div className="mt-5">
              {isLoading ? (
                <ScheduleState>Đang tải lịch phát sóng...</ScheduleState>
              ) : error ? (
                <ScheduleState tone="error">{error}</ScheduleState>
              ) : matches.length ? (
                <>
                  <ScheduleGrid matches={matches} />
                  {hasMore || isLoadingMore ? (
                    <div
                      ref={loadMoreRef}
                      className="flex min-h-[44px] items-center justify-center text-[13px] font-medium text-white/60"
                    >
                      {isLoadingMore ? "Đang tải thêm..." : hasMore ? "" : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <ScheduleState>Chưa có trận đấu cho ngày này.</ScheduleState>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
