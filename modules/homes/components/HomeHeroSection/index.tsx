"use client";

import OkwinLogo from "@/components/layout/OkwinLogo";
import LiveVideoPlayer from "@/components/video/LiveVideoPlayer";
import Image from "next/image";
import Link from "next/link";
import type { HomeLiveVideoItem } from "@/models/match";
import {
  useHomeHeroSection,
} from "../../hooks/useHomeHeroSection";
import {
  HeroMatchCard,
  PanelState,
  PlayIcon,
  VolumeIcon,
} from "./HomeHeroSectionParts";

const panelIconBasePath = "/assets/icon_video_pannel";
const videoPanelIcons = {
  pause: `${panelIconBasePath}/iconPause.svg`,
  muted: `${panelIconBasePath}/iconMuted.svg`,
  live: `${panelIconBasePath}/iconLive.svg`,
};
export default function HomeHeroSection({
  initialBannerImageUrls,
  initialPanelLiveItems,
}: {
  initialBannerImageUrls: string[];
  initialPanelLiveItems?: HomeLiveVideoItem[];
}) {
  const {
    activeBannerSafeIndex,
    activeBannerUrl,
    activeLiveDetailHref,
    activeVideoItem,
    categoryTabs,
    handlePlaybackError,
    handlePlaybackLoading,
    handlePlaybackReady,
    handlePlaybackStateChange,
    handleSelectLiveItem,
    handleToggleMuted,
    handleTogglePlay,
    handleVolumeChange,
    isActiveVideoLoading,
    isPanelMatchesLoading,
    isVideoMuted,
    isVideoPaused,
    panelLiveItems,
    panelMatchesError,
    playerRestoreKey,
    selectedCategoryTab,
    setActiveBannerIndex,
    setActiveCategoryId,
    videoPlayerRef,
    videoVolume,
    videoUrl,
    visiblePlaybackError,
  } = useHomeHeroSection({
    initialBannerImageUrls,
    initialPanelLiveItems,
  });
  const displayedVolume = isVideoMuted ? 0 : videoVolume;

  return (
    <section className="grid w-full gap-[15px] lg:grid-cols-[1.24fr_1fr] 2xl:grid-cols-[minmax(0,1.247fr)_minmax(0,1fr)] 2xl:gap-[10px]">
      <div className="relative aspect-[440/112] overflow-hidden rounded-[5px] bg-[radial-gradient(circle_at_44%_32%,#fff7ad_0,#ffc130_12%,#5b3613_34%,#111_74%)] sm:aspect-[1420/200] lg:col-span-2">
        {activeBannerUrl ? (
          <Image
            src={activeBannerUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1536px) 1418px, 100vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center sm:justify-end sm:pr-12 sm:text-right 2xl:pr-[112px]">
            <div>
              <OkwinLogo compact />
              <h1 className="mt-2 text-[28px] font-black uppercase leading-none tracking-[1px] sm:text-[34px] 2xl:text-[40px]">
                Mekong Rising
              </h1>
              <p className="mt-2 text-[13px] font-bold uppercase text-white/80 sm:text-[15px] 2xl:text-[17px]">
                One river. Many rivals. One champion
              </p>
              <div className="mx-auto mt-4 w-fit rounded-full bg-[#7b1818] px-5 py-1 text-[14px] font-black sm:px-8 sm:text-[16px] 2xl:mt-5 2xl:text-[18px]">
                05.11 - 09.11.2025
              </div>
            </div>
          </div>
        )}
        {initialBannerImageUrls.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {initialBannerImageUrls.map((url, index) => (
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

      <div className="group relative h-[240px] overflow-hidden rounded-[7px] bg-black sm:h-[320px] lg:h-[437px]">
        <div className="absolute inset-0 z-0">
          <LiveVideoPlayer
            key={`${activeVideoItem?.id || "empty"}-${
              videoUrl || "none"
            }-${playerRestoreKey}`}
            ref={videoPlayerRef}
            className="h-full w-full"
            muted={isVideoMuted}
            volume={videoVolume}
            onPlaybackError={handlePlaybackError}
            onPlaybackLoading={handlePlaybackLoading}
            onPlaybackReady={handlePlaybackReady}
            onPlaybackStateChange={handlePlaybackStateChange}
            src={videoUrl}
          />
        </div>

        {!videoUrl ? (
          <div className="absolute inset-0 z-[1] bg-black">
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[13px] font-medium text-white/75">
              {isPanelMatchesLoading || isActiveVideoLoading
                ? "Đang tải video live..."
                : panelMatchesError || "Chưa có video live để phát"}
            </div>
          </div>
        ) : null}

        {visiblePlaybackError ? (
          <div className="absolute left-4 right-4 top-4 z-[30] rounded bg-black/70 px-3 py-2 text-[12px] font-medium text-white">
            {visiblePlaybackError}
          </div>
        ) : null}
        {videoUrl && isActiveVideoLoading ? (
          <div className="absolute inset-0 z-[18] flex items-center justify-center bg-black/25">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        ) : null}
        {activeLiveDetailHref ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/0 opacity-0 transition duration-200 group-hover:bg-black/35 group-hover:opacity-100">
            <Link
              className="pointer-events-auto rounded-[5px] bg-[#ff8c13] px-6 py-3 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,.35)] transition hover:bg-[#ff9f2f]"
              href={activeLiveDetailHref}
            >
              Vào phòng
            </Link>
          </div>
        ) : null}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex h-[50px] items-center bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.4)_50%,rgba(0,0,0,.8)_100%)] px-[10px]">
          <div className="flex h-8 items-center gap-[10px] text-white">
            <button
              type="button"
              aria-label={isVideoPaused ? "Play video" : "Pause video"}
              aria-pressed={isVideoPaused}
              disabled={!videoUrl}
              onClick={handleTogglePlay}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[22px] leading-none text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isVideoPaused ? (
                <PlayIcon />
              ) : (
                <Image
                  src={videoPanelIcons.pause}
                  alt=""
                  width={32}
                  height={32}
                  aria-hidden
                />
              )}
            </button>
            <div className="group/volume flex h-8 items-center">
              <button
                type="button"
                aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
                aria-pressed={isVideoMuted}
                disabled={!videoUrl}
                onClick={handleToggleMuted}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[24px] leading-none text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isVideoMuted ? (
                  <Image
                    src={videoPanelIcons.muted}
                    alt=""
                    width={32}
                    height={32}
                    aria-hidden
                  />
                ) : (
                  <VolumeIcon />
                )}
              </button>
              <div className="flex w-0 overflow-hidden transition-[width] duration-200 group-hover/volume:w-[88px] group-focus-within/volume:w-[88px]">
                <input
                  type="range"
                  aria-label="Adjust video volume"
                  min={0}
                  max={100}
                  step={1}
                  disabled={!videoUrl}
                  value={Math.round(displayedVolume * 100)}
                  onChange={(event) => handleVolumeChange(Number(event.target.value) / 100)}
                  className="ml-2 w-[76px] cursor-pointer accent-[#ff8c13] disabled:cursor-not-allowed disabled:opacity-40"
                />
              </div>
            </div>
            <span className="relative h-6 w-[53px]">
              <Image
                src={videoPanelIcons.live}
                alt="Live"
                fill
                sizes="53px"
                className="object-contain"
              />
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col overflow-hidden rounded-[7px] bg-[#282828] px-[10px] py-[7px] lg:h-[437px]">
        <div className="mb-[10px] flex h-8 items-start justify-between gap-[8px] overflow-hidden min-[1920px]:h-9 min-[1920px]:gap-[10px]">
          <div className="flex min-w-0 flex-1 items-center gap-[6px] overflow-x-auto pb-2 min-[1920px]:gap-[15px]">
            {categoryTabs.map((tab) => {
              const isActive = tab.id === selectedCategoryTab?.id;

              return (
                <button
                  key={tab.label}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategoryId(tab.id)}
                  className={`flex h-8 shrink-0 cursor-pointer items-center justify-center gap-[4px] rounded-[5px] px-[8px] text-[12px] font-medium min-[1920px]:h-9 min-[1920px]:gap-[5px] min-[1920px]:px-[10px] min-[1920px]:text-[14px] ${
                    isActive
                      ? "bg-[linear-gradient(0deg,#ffa54e_0%,#fd8901_100%)] text-white"
                      : "bg-[#343434] text-[#919191]"
                  }`}
                >
                  {tab.iconSrc ? (
                    <Image
                      src={tab.iconSrc}
                      alt=""
                      width={18}
                      height={18}
                      aria-hidden
                      className="h-[17px] w-[17px] object-contain min-[1920px]:h-5 min-[1920px]:w-5"
                    />
                  ) : null}
                  <span className="max-w-[70px] truncate min-[1920px]:max-w-[86px]">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-[10px] min-[400px]:grid-cols-2 lg:grid-cols-2 lg:grid-rows-[1fr_1fr]">
          {isPanelMatchesLoading ? (
            <PanelState>Đang tải phòng live...</PanelState>
          ) : panelMatchesError ? (
            <PanelState>{panelMatchesError}</PanelState>
          ) : panelLiveItems.length ? (
            panelLiveItems.map((item) => (
              <HeroMatchCard
                key={item.id}
                item={item}
                isActive={item.id === activeVideoItem?.id}
                activeCommentatorId={
                  item.id === activeVideoItem?.id
                    ? activeVideoItem.channel.live.commentatorId
                    : undefined
                }
                onSelect={handleSelectLiveItem}
              />
            ))
          ) : (
            <PanelState>Chưa có phòng live.</PanelState>
          )}
        </div>
      </div>
    </section>
  );
}
