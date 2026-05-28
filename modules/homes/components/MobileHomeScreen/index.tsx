"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LiveVideoPlayer from "@/components/video/LiveVideoPlayer";
import { getHomeLivePlaybackUrl } from "@/helpers/livePlayback";
import { buildLiveDetailSlug } from "@/helpers/string";
import type {
  HomeLiveCategoryCountsResponse,
  HomeLiveVideoItem,
  HomeLiveVideoResponse,
} from "@/models/match";
import type { HomeAssets } from "@/services/homeAssets";
import { getAssetImageUrl } from "@/services/homeAssets";
import { getHomeLiveVideo } from "@/services/matches";
import {
  gifts,
  homeCategories,
  streamerNames,
  type HomeCategory,
} from "../homeData";
import { ChannelLiveCard } from "../HomeCards";
import HotLiveSection from "../HotLiveSection";

const playbackRefreshRetryMs = 30000;

export default function MobileHomeScreen({
  categoryLiveVideos,
  heroPanelLiveItems,
  homeAssets,
  homeLiveCategoryCounts,
  hotLiveItems,
}: {
  categoryLiveVideos: Partial<Record<HomeCategory["id"], HomeLiveVideoItem[]>>;
  heroPanelLiveItems: HomeLiveVideoItem[];
  homeAssets: HomeAssets;
  homeLiveCategoryCounts: HomeLiveCategoryCountsResponse;
  hotLiveItems: HomeLiveVideoItem[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    HomeCategory["id"] | "all"
  >("all");
  const allCategoryCards = homeCategories.flatMap(
    (category) => categoryLiveVideos[category.id] || [],
  );
  const liveCards =
    selectedCategoryId === "all"
      ? allCategoryCards
      : categoryLiveVideos[selectedCategoryId] || [];
  const tabCounts = {
    all: allCategoryCards.length,
    sports: categoryLiveVideos.sports?.length || 0,
    esports: categoryLiveVideos.esports?.length || 0,
    casino: categoryLiveVideos.casino?.length || 0,
    idol: categoryLiveVideos.idol?.length || 0,
  } satisfies Record<HomeCategory["id"] | "all", number>;

  return (
    <main
      id="home-mobile"
      className="min-h-screen bg-[#111] pt-[50px] text-white"
    >
      <div className="mx-auto w-full px-2.5 pb-[88px]">
        <MobileHero
          initialBannerImageUrls={homeAssets.bannerMobileImageUrls}
          initialPanelLiveItems={heroPanelLiveItems}
        />
        <HotLiveSection
          initialCategoryCounts={homeLiveCategoryCounts}
          initialItems={hotLiveItems}
        />
        <MobileCategoryTabs
          counts={tabCounts}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
        <div className="grid grid-cols-2 gap-2">
          {liveCards.length ? (
            liveCards.map((item) => (
              <ChannelLiveCard
                key={`${selectedCategoryId}-${item.id}`}
                item={item}
                size="hot"
              />
            ))
          ) : (
            <div className="col-span-2 rounded bg-[#2a2a2a] px-3 py-6 text-center text-[12px] text-white/70">
              Hiện tại chưa có kênh live nào
            </div>
          )}
        </div>
        <div className="my-2.75 flex justify-center">
          <button
            className="inline-flex items-center justify-center gap-[3px] rounded-[5px] bg-[linear-gradient(180deg,#FD8901_0%,#FFA54E_100%)] px-[10px] py-[8px] text-[12px] font-medium leading-none text-white"
            type="button"
          >
            <span>Xem Tất Cả</span>
            <Image
              src="/assets/navbars/ic_all.svg"
              alt=""
              width={12}
              height={12}
              className="h-3 w-3 shrink-0"
              aria-hidden
            />
          </button>
        </div>
        <MobileStreamerSection />
        <MobileSection icon="🎁" title="Quà Tặng">
          <div className="mb-2 grid grid-cols-2 gap-2 rounded-b-[5px] bg-[#2a2a2a] p-2 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-[#c29b72]" />
              <span>Chúc mừng **Username nhận được 1 Áo Polo OKWINTV</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-[#c29b72]" />
              <span>Chúc mừng **User nhận được 1 Áo Polo</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {gifts.slice(0, 2).map(([name], index) => (
              <MobileGift
                key={`${name}-${index}`}
                name={name}
                shirt={index === 1}
              />
            ))}
          </div>
        </MobileSection>
        <MobilePromoSection />
        <MobileArticleSection icon="▶" title="Video Nổi Bật" />
        <MobileArticleSection icon="▣" title="Tin Tức" />
        <MobileAbout />
        <MobileFooter />
      </div>
    </main>
  );
}

function MobileHero({
  initialBannerImageUrls,
  initialPanelLiveItems,
}: {
  initialBannerImageUrls: string[];
  initialPanelLiveItems: HomeLiveVideoItem[];
}) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [playbackError, setPlaybackError] = useState("");
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [playerRestoreKey, setPlayerRestoreKey] = useState(0);
  const [activeVideoItem, setActiveVideoItem] = useState<HomeLiveVideoItem | null>(
    () => initialPanelLiveItems[0] || null,
  );
  const playbackRetryActiveRef = useRef(false);
  const playbackRetryTimeoutRef = useRef<number | undefined>(undefined);

  const stopPlaybackRetry = useCallback(() => {
    playbackRetryActiveRef.current = false;
    if (playbackRetryTimeoutRef.current) {
      window.clearTimeout(playbackRetryTimeoutRef.current);
      playbackRetryTimeoutRef.current = undefined;
    }
  }, []);

  const refreshActiveVideoPlayback = useCallback(
    async (showError = false) => {
      const item = activeVideoItem;
      if (!item || item.channel.isLink || !item.channel.live?.roomName) {
        return false;
      }

      try {
        const response = await getHomeLiveVideo(
          item.channel._id,
          item.channel.live.roomName,
          item.channel.live.commentatorId,
        );

        setActiveVideoItem((currentItem) => {
          if (
            !currentItem ||
            currentItem.id !== item.id ||
            currentItem.channel.live.roomName !== item.channel.live.roomName ||
            currentItem.channel.live.commentatorId !== item.channel.live.commentatorId
          ) {
            return currentItem;
          }

          return mapHomeLiveVideoResponseToItem(response, currentItem);
        });
        setPlaybackError("");

        return true;
      } catch (error) {
        if (showError) {
          setPlaybackError(
            error instanceof Error ? error.message : "KhÃ´ng thá»ƒ lÃ m má»›i video live",
          );
        }

        return false;
      }
    },
    [activeVideoItem],
  );

  const runPlaybackRetry = useCallback(
    function retryPlayback() {
      if (!playbackRetryActiveRef.current) {
        return;
      }

      void refreshActiveVideoPlayback(true).finally(() => {
        if (!playbackRetryActiveRef.current) {
          return;
        }

        setPlayerRestoreKey((currentKey) => currentKey + 1);
        playbackRetryTimeoutRef.current = window.setTimeout(
          retryPlayback,
          playbackRefreshRetryMs,
        );
      });
    },
    [refreshActiveVideoPlayback],
  );

  const handlePlaybackReady = useCallback(() => {
    stopPlaybackRetry();
    setIsVideoLoading(false);
    setPlaybackError("");
  }, [stopPlaybackRetry]);
  const handlePlaybackLoading = useCallback(() => {
    setPlaybackError("");
    setIsVideoLoading(true);
  }, []);
  const handlePlaybackError = useCallback(
    (message: string) => {
      setIsVideoLoading(false);
      setPlaybackError(message);

      if (playbackRetryActiveRef.current) {
        return;
      }

      playbackRetryActiveRef.current = true;
      runPlaybackRetry();
    },
    [runPlaybackRetry],
  );
  const bannerImageUrls = useMemo(
    () =>
      initialBannerImageUrls
        .map((url) => getAssetImageUrl(url))
        .filter((url): url is string => Boolean(url)),
    [initialBannerImageUrls],
  );
  const activeBannerSafeIndex = bannerImageUrls.length
    ? activeBannerIndex % bannerImageUrls.length
    : 0;
  const activeBannerUrl = bannerImageUrls[activeBannerSafeIndex];
  const videoUrl = getHomeLivePlaybackUrl(activeVideoItem);
  const activeLiveDetailHref = activeVideoItem
    ? `/live/${buildLiveDetailSlug(activeVideoItem)}`
    : "";

  useEffect(() => {
    if (bannerImageUrls.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveBannerIndex(
        (currentIndex) => (currentIndex + 1) % bannerImageUrls.length,
      );
    }, 4000);

    return () => window.clearInterval(interval);
  }, [bannerImageUrls.length]);

  useEffect(() => {
    setActiveVideoItem((currentItem) => currentItem || initialPanelLiveItems[0] || null);
  }, [initialPanelLiveItems]);

  useEffect(() => {
    return () => stopPlaybackRetry();
  }, [activeVideoItem?.id, stopPlaybackRetry]);

  return (
    <>
      {activeBannerUrl ? (
        <div className="relative my-2.5 h-[112px] overflow-hidden rounded-[10px]">
          <Image
            src={activeBannerUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          {bannerImageUrls.length > 1 ? (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {bannerImageUrls.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  aria-label={`Chọn banner ${index + 1}`}
                  className={`h-2 w-2 rounded-full ${
                    index === activeBannerSafeIndex
                      ? "bg-[#ff8c13]"
                      : "bg-white/60"
                  }`}
                  type="button"
                  onClick={() => setActiveBannerIndex(index)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="relative aspect-[162/91] w-full overflow-hidden rounded-[5px] bg-black">
        {videoUrl ? (
          <LiveVideoPlayer
            key={`${activeVideoItem?.id || "empty"}-${videoUrl}-${playerRestoreKey}`}
            className="h-full w-full"
            muted
            onPlaybackError={handlePlaybackError}
            onPlaybackLoading={handlePlaybackLoading}
            onPlaybackReady={handlePlaybackReady}
            src={videoUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-[12px] font-medium text-white/70">
            Chưa có video live để phát
          </div>
        )}
        {playbackError ? (
          <div className="absolute left-2 right-2 top-2 z-20 rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
            {playbackError}
          </div>
        ) : null}
        {videoUrl && isVideoLoading ? (
          <div className="absolute inset-0 z-[18] flex items-center justify-center bg-black/25">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        ) : null}
        {activeLiveDetailHref ? (
          <Link
            className="absolute left-1/2 top-1/2 z-10 flex h-[29px] w-[159px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[8px] rounded-[5px] border border-[#F4B748] bg-[#333333]/[.74] text-[12px] font-normal text-[#F4B748] shadow-[0_4px_4px_rgba(0,0,0,.25)]"
            href={activeLiveDetailHref}
          >
            <Image
              src="/assets/ic_play_mobile.svg"
              alt=""
              width={14}
              height={16}
              className="h-[16px] w-[14px] shrink-0 drop-shadow-[0_4px_4px_rgba(0,0,0,.25)] mt-1.25"
              aria-hidden
            />
            <span className="bg-[linear-gradient(180deg,#F4B748_19%,#FF8100_48.5%)] bg-clip-text text-transparent">
              Vào Phòng Trực Tiếp
            </span>
          </Link>
        ) : null}
      </div>
    </>
  );
}

function mapHomeLiveVideoResponseToItem(
  response: HomeLiveVideoResponse,
  fallbackItem: HomeLiveVideoItem,
): HomeLiveVideoItem {
  return {
    ...fallbackItem,
    match: response.match || fallbackItem.match,
    channel: response.channel || fallbackItem.channel,
    videoUrl: response.videoUrl,
    authorizedPlaybackUrl: response.authorizedPlaybackUrl,
    token: response.token || "",
    expiresAt: response.expiresAt || 0,
    liveBackgroundImageUrl: response.liveBackgroundImageUrl,
  };
}

function MobileCategoryTabs({
  counts,
  onSelectCategory,
  selectedCategoryId,
}: {
  counts: Record<HomeCategory["id"] | "all", number>;
  onSelectCategory: (categoryId: HomeCategory["id"] | "all") => void;
  selectedCategoryId: HomeCategory["id"] | "all";
}) {
  const tabs: Array<{ id: HomeCategory["id"] | "all"; label: string }> = [
    { id: "all", label: "Tất Cả" },
    { id: "sports", label: "Thể Thao" },
    { id: "esports", label: "Esport" },
    { id: "casino", label: "Casino" },
    { id: "idol", label: "Idol Live" },
  ];

  return (
    <div className="my-2 grid w-full grid-cols-5 gap-1">
      {tabs.map((tab) => {
        const isActive = tab.id === selectedCategoryId;

        return (
          <button
            key={tab.id}
            className={`inline-flex min-w-0 items-center justify-center gap-[3px] rounded-[5px] px-[3px] py-[4.5px] text-[10px] font-medium ${
              isActive
                ? "bg-[linear-gradient(180deg,#FD8901_0%,#FFA54E_100%)] text-white"
                : "bg-[#3a3a3a] text-[#bdbdbd]"
            }`}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectCategory(tab.id)}
          >
            <span className="min-w-0 truncate">{tab.label}</span>
            <span className="relative h-5 w-5 shrink-0">
              <span className="absolute left-px top-px h-[18px] w-[18px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,.5)_0%,rgba(255,255,255,0)_100%)]" />
              <span className="absolute left-px top-px flex h-[18px] w-[18px] items-center justify-center text-[9px] font-medium text-white">
                {counts[tab.id]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MobileSection({
  children,
  icon,
  iconSrc,
  title,
}: {
  children: ReactNode;
  icon?: string;
  iconSrc?: string;
  title: string;
}) {
  return (
    <section className="mt-3">
      <div className="flex h-7 items-center justify-between rounded-t-[5px] bg-[#f68c1f] px-2 text-white">
        <h2 className="flex min-w-0 items-center gap-1 truncate text-[13px] font-bold">
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 shrink-0 object-contain"
              aria-hidden
            />
          ) : icon ? (
            <span className="shrink-0">{icon}</span>
          ) : null}
          <span className="truncate">{title}</span>
        </h2>
        <button
          className="inline-flex items-center gap-[3px] text-[10px] font-semibold"
          type="button"
        >
          <span>Xem Tất Cả</span>
          <Image
            src="/assets/navbars/ic_all.svg"
            alt=""
            width={12}
            height={12}
            className="h-3 w-3 shrink-0"
            aria-hidden
          />
        </button>
      </div>
      {children}
    </section>
  );
}

function MobileStreamerSection() {
  return (
    <section className="mt-3 overflow-hidden rounded-[5px] border border-[#f68c1f] bg-[#292929]">
      <div className="flex h-5 items-center bg-[#f68c1f] px-1.5 text-white">
        <h2 className="flex min-w-0 items-center gap-1 truncate text-[14px] font-bold leading-none">
          <Image
            src="/assets/ic_top_streamer.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 shrink-0 object-contain"
            aria-hidden
          />
          <span className="truncate">Top Streamer Hot</span>
        </h2>
      </div>
      <div className="grid grid-cols-4 gap-2 py-2.5 px-3.75">
        {streamerNames.slice(0, 4).map((name, index) => (
          <MobileStreamer key={`${name}-${index}`} name={name} />
        ))}
      </div>
    </section>
  );
}

function MobileStreamer({ name }: { name: string }) {
  return (
    <div className="min-w-0 text-center">
      <div className="relative mx-auto h-[50px] w-[50px] rounded-full border-2 border-[#f68c1f] bg-[radial-gradient(circle,#ffe2cd_0,#d96744_45%,#3d1a12_100%)]">
        <span className="absolute -bottom-0.5 left-1 rounded-[2px] bg-red-600 px-1 text-[6px] font-black leading-[9px]">
          LIVE
        </span>
      </div>
      <div className="mt-1 truncate text-[14px] font-normal leading-none">
        {name}
      </div>
      <div className="mt-1 flex h-[14px] min-w-0 items-center justify-center gap-0.5 rounded-[3px] bg-[#777] px-1 text-[8px] leading-none">
        <Image
          src="/assets/ic_user_streamer_un.svg"
          alt=""
          width={10}
          height={10}
          className="h-[10px] w-[10px] shrink-0 object-contain"
          aria-hidden
        />
        <span className="truncate">Đã Theo Dõi</span>
      </div>
    </div>
  );
}

function MobileGift({ name, shirt }: { name: string; shirt?: boolean }) {
  return (
    <article className="overflow-hidden rounded-[5px] border border-[#f68c1f] bg-[#292929]">
      <div className="relative h-[112px] bg-[linear-gradient(90deg,#ffb75e,#ffd69a,#ffb04a)]">
        <div className="absolute inset-x-0 top-0 bg-[#a76b1e] py-1 text-center text-[11px] font-bold">
          Còn Hàng
        </div>
        <div
          className={`absolute left-1/2 top-[40px] -translate-x-1/2 bg-white shadow-xl ${
            shirt
              ? "h-[54px] w-[58px] rounded-t-[18px]"
              : "h-[58px] w-[32px] rotate-[-17deg] rounded-[8px]"
          }`}
        />
      </div>
      <div className="px-2 py-2">
        <h3 className="truncate text-[11px]">{name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#ffca3a]">50.000 ●</span>
          <button
            className="rounded bg-[#f68c1f] px-2 py-1 text-[10px] font-bold"
            type="button"
          >
            Đổi Quà
          </button>
        </div>
      </div>
    </article>
  );
}

function MobilePromoSection() {
  return (
    <MobileSection icon="🔥" title="Sự Kiện Và Khuyến Mãi">
      <div className="flex gap-2 overflow-x-auto">
        {[0, 1].map((item) => (
          <article
            key={item}
            className="min-w-[260px] overflow-hidden rounded-[5px] border border-[#f68c1f] bg-[#292929]"
          >
            <div className="h-[104px] bg-[linear-gradient(180deg,#fff34a_0,#ff8014_42%,#e51724_100%)] p-2">
              <span className="rounded bg-[#0daa53] px-2 py-0.5 text-[9px] font-bold">
                Đang Diễn Ra
              </span>
              <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[22px] font-black italic">
                <span>+8%</span>
                <span>+10%</span>
                <span>+15%</span>
              </div>
            </div>
            <div className="p-2">
              <h3 className="truncate text-[11px] font-bold">
                Siêu Ngày Đôi - Nạp Tiền Nhận Ngay Ưu Đãi
              </h3>
              <p className="mt-1 truncate text-[10px] text-[#bbb]">
                Bạn đã sẵn sàng để chạm tay vào vận may...
              </p>
            </div>
          </article>
        ))}
      </div>
    </MobileSection>
  );
}

function MobileArticleSection({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <MobileSection icon={icon} title={title}>
      <div className="grid grid-cols-2 gap-2">
        {[0, 1].map((item) => (
          <article
            key={item}
            className="overflow-hidden rounded-[5px] bg-[#292929]"
          >
            <div className="relative h-[94px]">
              <Image
                src="/assets/bg-sports.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="50vw"
              />
              <span className="absolute bottom-1 left-1 rounded bg-[#f68c1f] px-1.5 py-0.5 text-[9px] font-bold">
                03:02
              </span>
            </div>
            <div className="p-2">
              <div className="mb-1 flex gap-1">
                <span className="rounded bg-[#f68c1f] px-1 text-[9px] font-bold">
                  #Hot
                </span>
                <span className="rounded bg-[#f68c1f] px-1 text-[9px] font-bold">
                  #Thể Thao
                </span>
              </div>
              <h3 className="line-clamp-2 text-[11px] leading-4">
                Man Utd thắng đậm, Arsenal cạnh tranh ngôi đầu
              </h3>
              <div className="mt-1 flex justify-between text-[9px] text-[#aaa]">
                <span>06/11/2025</span>
                <span>⊙ 5 ♡ 0</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </MobileSection>
  );
}

function MobileAbout() {
  const rows = [
    "Lịch Sử Hình Thành Của OKWINTV",
    "Mục Đích Thành Lập Của OKWINTV",
    "Những Ưu Điểm Nổi Bật Của OKWINTV",
    "Những Lí Do Nên Xem Trực Tiếp Bóng Đá Tại OKWINTV",
    "Kết Luận",
  ];

  return (
    <section
      id="about-mobile"
      className="mt-4 rounded-[5px] border border-[#6a4b28] bg-[#303030] p-3"
    >
      <h2 className="mb-3 text-center text-[13px] font-bold text-[#f68c1f]">
        {"/// Giới Thiệu Về OKWINTV ///"}
      </h2>
      <div className="rounded border border-[#f68c1f] p-2">
        <h3 className="mb-2 text-[12px] font-bold text-[#f68c1f]">
          OKWINTV Là Gì?
        </h3>
        <p className="text-[11px] leading-5 text-[#ddd]">
          OKWINTV: Nền tảng phát sóng trực tiếp bóng đá và Esport 24/7 miễn phí,
          không quảng cáo với chất lượng full HD tốc độ cao.
        </p>
      </div>
      <div className="mt-2 grid gap-1 text-[11px] text-[#bbb]">
        {rows.map((row) => (
          <button
            key={row}
            className="flex h-9 items-center justify-between text-left"
            type="button"
          >
            <span className="min-w-0 truncate">{row}</span>
            <span className="shrink-0">⌄</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MobileFooter() {
  const links = [
    "Về Chúng Tôi",
    "Giới Thiệu",
    "Liên Hệ",
    "Chính Sách Bảo Mật",
    "Thỏa Thuận Phát Sóng Trực Tiếp",
    "Cam Kết Và Thỏa Thuận Người Dùng",
  ];

  return (
    <footer className="mt-4 bg-[#242424] px-3 py-4">
      <div className="mb-3 flex items-center justify-center gap-4">
        <Image
          src="/assets/logo.png"
          alt="OKWINTV"
          width={124}
          height={34}
          className="h-auto w-[124px]"
        />
        <span className="h-8 w-px bg-[#777]" />
        <Image
          src="/assets/header_qc.png"
          alt=""
          width={105}
          height={32}
          className="h-8 w-[105px] object-contain"
        />
      </div>
      <div className="grid gap-2 text-[13px] text-[#d5d5d5]">
        {links.map((link) => (
          <a
            key={link}
            className="border-b border-[#555] pb-1"
            href="#about-mobile"
          >
            » {link}
          </a>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px]">
        <span className="rounded bg-[#f8dd55] px-2 py-1 font-black text-black">
          DMCA PROTECTED
        </span>
        <span>Website OKWINTV Được Bảo Vệ Bởi DMCA</span>
      </div>
    </footer>
  );
}
