"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type {
  HomeLiveCategoryCountsResponse,
  HomeLiveVideoItem,
} from "@/models/match";
import { getHomeLiveCategoryCounts } from "@/services/matches";
import { ChannelLiveCard } from "../HomeCards";
import { LiveSectionState } from "./HotLiveSectionParts";
import { useHomeHotLiveVideos } from "../../hooks/useHomeHotLiveVideos";

const hotLiveTabs: Array<{
  categoryName?: string;
  iconSrc: string;
  key: string;
  label: string;
}> = [
  { iconSrc: "/assets/icon_video_pannel/Group.svg", key: "hot", label: "Hot" },
  { categoryName: "Bóng đá", iconSrc: "/assets/bongda.svg", key: "football", label: "Bóng đá" },
  { categoryName: "Bóng rổ", iconSrc: "/assets/bongro.svg", key: "basketball", label: "Bóng rổ" },
  { categoryName: "Tennis", iconSrc: "/assets/tenis.svg", key: "tennis", label: "Tennis" },
  { categoryName: "Bóng chuyền", iconSrc: "/assets/bongchuyen.svg", key: "volleyball", label: "Bóng chuyền" },
  { categoryName: "Bóng bàn", iconSrc: "/assets/bongban.svg", key: "table-tennis", label: "Bóng bàn" },
  { categoryName: "Esports", iconSrc: "/assets/ic_white_esports.svg", key: "esports", label: "Esports" },
  { categoryName: "Casino", iconSrc: "/assets/ic_white_casino.svg", key: "casino", label: "Casino" },
  { categoryName: "Idol live", iconSrc: "/assets/ic_white_idol.svg", key: "idol", label: "Idol live" },
];

const mobileCategoryTabs: Array<{
  categoryName?: string;
  iconSrc: string;
  key: string;
  label: string;
}> = [
  { iconSrc: "/assets/icon_video_pannel/Group.svg", key: "hot", label: "Hot" },
  { categoryName: "Bóng đá", iconSrc: "/assets/bongda.svg", key: "football", label: "Bóng đá" },
  { categoryName: "Bóng rổ", iconSrc: "/assets/bongro.svg", key: "basketball", label: "Bóng rổ" },
  { categoryName: "Tennis", iconSrc: "/assets/tenis.svg", key: "tennis", label: "Tennis" },
  { categoryName: "Bóng chuyền", iconSrc: "/assets/bongchuyen.svg", key: "volleyball", label: "Bóng chuyền" },
  { categoryName: "Esports", iconSrc: "/assets/ic_white_esports.svg", key: "esports", label: "Esport" },
  { categoryName: "Casino", iconSrc: "/assets/ic_white_casino.svg", key: "casino", label: "Casino" },
  { categoryName: "Idol live", iconSrc: "/assets/ic_white_idol.svg", key: "idol", label: "Idol Live" },
];

export default function HotLiveSection({
  enableMobileCounts = true,
  initialCategoryCounts,
  initialItems,
}: {
  enableMobileCounts?: boolean;
  initialCategoryCounts?: HomeLiveCategoryCountsResponse;
  initialItems?: HomeLiveVideoItem[];
}) {
  const [activeTabKey, setActiveTabKey] = useState("hot");
  const [mobileTabCounts, setMobileTabCounts] = useState<Record<string, number>>(
    () => ({
      hot: initialItems?.length || 0,
      ...initialCategoryCounts,
    }),
  );
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const activeTab =
    [...mobileCategoryTabs, ...hotLiveTabs].find((tab) => tab.key === activeTabKey) ||
    hotLiveTabs[0];
  const { error, hasMore, isLoading, isLoadingMore, items, loadMore } =
    useHomeHotLiveVideos({
      categoryName: activeTab.categoryName,
      initialItems,
    });
  const visibleItems = items;

  useEffect(() => {
    if (!enableMobileCounts) {
      return;
    }

    if (initialCategoryCounts) {
      setMobileTabCounts((currentCounts) => ({
        ...currentCounts,
        ...initialCategoryCounts,
      }));
      return;
    }

    let isActive = true;

    async function loadMobileTabCounts() {
      try {
        const nextCounts = await getHomeLiveCategoryCounts();

        if (isActive) {
          setMobileTabCounts((currentCounts) => ({
            ...currentCounts,
            ...nextCounts,
          }));
        }
      } catch {
        if (isActive) {
          setMobileTabCounts((currentCounts) => ({ ...currentCounts }));
        }
      }
    }

    void loadMobileTabCounts();

    return () => {
      isActive = false;
    };
  }, [enableMobileCounts, initialCategoryCounts]);

  useEffect(() => {
    const loadMoreNode = loadMoreRef.current;

    if (
      !activeTab.categoryName ||
      !loadMoreNode ||
      !hasMore ||
      isLoading ||
      isLoadingMore
    ) {
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
  }, [
    activeTab.categoryName,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
  ]);

  return (
    <section id="hot-live" className="mt-[25px]">
      <div className="my-2 grid w-full grid-cols-4 gap-1 sm:hidden">
        {mobileCategoryTabs.map((tab) => {
          const isActive = activeTabKey === tab.key;

          return (
            <button
              key={tab.key}
              className={`inline-flex min-w-0 items-center justify-center gap-[3px] rounded-[5px] px-[3px] py-[4.5px] text-[10px] font-medium ${
                isActive
                  ? "bg-[linear-gradient(180deg,#FD8901_0%,#FFA54E_100%)] text-white"
                  : "bg-[#3a3a3a] text-[#bdbdbd]"
              }`}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveTabKey(tab.key)}
            >
              <Image
                src={tab.iconSrc}
                alt=""
                width={12}
                height={12}
                className="h-3 w-3 shrink-0 object-contain"
                aria-hidden
              />
              <span className="min-w-0 truncate">{tab.label}</span>
              <span className="relative h-5 w-5 shrink-0">
                <span className="absolute left-px top-px h-[18px] w-[18px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,.5)_0%,rgba(255,255,255,0)_100%)]" />
                <span className="absolute left-px top-px flex h-[18px] w-[18px] items-center justify-center text-[9px] font-medium text-white">
                  {mobileTabCounts[tab.key] || 0}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="hidden min-h-[50px] items-center justify-between gap-3 rounded-t-[8px] bg-[linear-gradient(180deg,#838383_0%,#4C4C4C_100%)] px-[10px] py-[7px] sm:flex">
        <div className="flex min-w-0 flex-1 gap-[14px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {hotLiveTabs.map((tab) => {
            const isActive = activeTabKey === tab.key;

            return (
              <button
                key={tab.key}
                className={`flex h-[36px] shrink-0 cursor-pointer items-center gap-[6px] rounded-[4px] px-[10px] text-[14px] font-medium transition ${
                  isActive
                    ? "bg-[linear-gradient(180deg,#FD8901_0%,#FFA54E_100%)] text-white"
                    : "bg-[#333] text-[#bdbdbd] hover:text-white"
                }`}
                type="button"
                onClick={() => setActiveTabKey(tab.key)}
              >
                <span className="relative h-[18px] w-[18px] shrink-0">
                  <Image
                    src={tab.iconSrc}
                    alt=""
                    fill
                    sizes="18px"
                    className="object-contain"
                    aria-hidden
                  />
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <a
          className="hidden shrink-0 items-center gap-[8px] text-[20px] font-medium text-white sm:flex"
          href="#hot-live"
        >
          Xem Tất Cả
          <span className="relative h-[26px] w-[26px] shrink-0">
            <Image
              src="/assets/navbars/ic_all.svg"
              alt=""
              fill
              sizes="26px"
              className="object-contain"
              aria-hidden
            />
          </span>
        </a>
      </div>
      <div className="grid grid-cols-2 gap-[8px] bg-[#111] p-[8px] sm:gap-[10px] lg:grid-cols-3 2xl:grid-cols-4">
        {isLoading ? (
          <LiveSectionState>Đang tải live...</LiveSectionState>
        ) : error ? (
          <LiveSectionState>{error}</LiveSectionState>
        ) : visibleItems.length ? (
          visibleItems.map((item) => (
            <ChannelLiveCard key={item.id} item={item} size="hot" />
          ))
        ) : (
          <LiveSectionState>Hiện tại chưa có lich live nào</LiveSectionState>
        )}
      </div>
      {activeTab.categoryName && (hasMore || isLoadingMore) ? (
        <div
          ref={loadMoreRef}
          className="flex min-h-[44px] items-center justify-center bg-[#111] text-[13px] font-medium text-white/60"
        >
          {isLoadingMore ? "Đang tải thêm..." : hasMore ? "" : null}
        </div>
      ) : null}
    </section>
  );
}
