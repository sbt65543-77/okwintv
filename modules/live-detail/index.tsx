"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LiveVideoPlayer from "@/components/video/LiveVideoPlayer";
import HomeSidebar from "@/modules/homes/components/HomeSidebar";
import HotLiveSection from "@/modules/homes/components/HotLiveSection";
import type {
  HomeLiveChannelItem,
  HomeLiveVideoItem,
  HomeLiveVideoResponse,
} from "@/models/match";
import {
  getTodayEndISOString,
  getTodayStartISOString,
  isIdolMatch,
} from "@/helpers/string";
import { buildLiveChatRoomId } from "@/helpers/chatRoom";
import { getAssetImageUrl } from "@/services/homeAssets";
import {
  getHomeHotLiveVideos,
  getHomeLiveVideo,
} from "@/services/matches";
import type { ChatMessageItem } from "@/services/chat";
import {
  defaultLiveRoomSettings,
  getLiveRoomSettings,
  type LiveRoomSettings,
} from "@/services/liveRoomSettings";
import GiftStripComponent from "./components/GiftStrip";
import LiveChatPanelComponent from "./components/LiveChatPanel";
import LiveHeaderComponent from "./components/LiveHeader";
import LiveVideoControlsComponent from "./components/LiveVideoControls";
import { useLiveDetailVideo } from "./hooks/useLiveDetailVideo";

const playbackRefreshRetryMs = 30000;

const getLivePlaybackUrl = (
  live: HomeLiveChannelItem | null | undefined,
  isLink?: boolean,
) => {
  if (!live) {
    return undefined;
  }

  if (isLink) {
    return live.videoUrl || undefined;
  }

  return (
    live.videoUrl ||
    live.authorizedPlaybackUrl ||
    undefined
  );
};

export default function LiveDetailPage({
  channelId,
  initialChatRoomId,
  initialChatMessages,
  initialData,
  initialHotLiveItems,
  initialRoomName,
  initialSelectedCommentatorId,
  liveRoomSettings: initialLiveRoomSettings,
}: {
  channelId: string;
  initialChatRoomId?: string;
  initialChatMessages?: ChatMessageItem[];
  initialData?: HomeLiveVideoResponse | null;
  initialHotLiveItems?: HomeLiveVideoItem[];
  initialRoomName?: string;
  initialSelectedCommentatorId?: string;
  liveRoomSettings?: LiveRoomSettings;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<HomeLiveVideoResponse | null>(
    () => initialData || null,
  );
  const [isLiveDetailLoading, setIsLiveDetailLoading] = useState(!initialData);
  const [hotLiveItems, setHotLiveItems] = useState<HomeLiveVideoItem[]>(
    () => initialHotLiveItems || [],
  );
  const [liveRoomSettings, setLiveRoomSettings] = useState<LiveRoomSettings>(
    () => initialLiveRoomSettings || defaultLiveRoomSettings,
  );
  const [isPlaybackSourceReady, setIsPlaybackSourceReady] = useState(false);
  const [playerRestoreKey, setPlayerRestoreKey] = useState(0);
  const didApplyInitialDataRef = useRef(false);
  const playbackRetryActiveRef = useRef(false);
  const playbackRetryTimeoutRef = useRef<number | undefined>(undefined);
  const error = data || isLiveDetailLoading ? "" : "Không thể tải phòng live";
  const liveOptions = useMemo(() => {
    if (data?.channel?.lives?.length) {
      return data.channel.lives;
    }

    return data?.channel?.live ? [data.channel.live] : [];
  }, [data]);
  const [selectedLiveIndex, setSelectedLiveIndex] = useState(0);
  const selectedLive = liveOptions[selectedLiveIndex] || liveOptions[0] || null;
  const chatRoomId = buildLiveChatRoomId(channelId, selectedLive, selectedLiveIndex);
  const chatInitialMessages =
    chatRoomId === initialChatRoomId ? initialChatMessages : undefined;
  const selectedLiveKey = `${selectedLive?.roomName || ""}-${selectedLive?.commentatorId || ""}-${selectedLiveIndex}`;
  const {
    chatPanelHeight,
    handlePlaybackError,
    handlePlaybackLoading,
    handlePlaybackReady,
    handleMutedStateChange,
    handleToggleFullscreen,
    handleToggleMuted,
    handleTogglePlay,
    handleVolumeChange,
    isVideoFullscreen,
    isVideoMuted,
    isVideoPaused,
    isVideoLoading,
    isPseudoVideoFullscreen,
    liveMediaContentRef,
    playbackError,
    desiredVideoMuted,
    videoVolume,
    videoContainerRef,
    videoPlayerRef,
  } = useLiveDetailVideo(selectedLiveKey);

  const stopPlaybackRetry = useCallback(() => {
    playbackRetryActiveRef.current = false;
    if (playbackRetryTimeoutRef.current) {
      window.clearTimeout(playbackRetryTimeoutRef.current);
      playbackRetryTimeoutRef.current = undefined;
    }
  }, []);

  const refreshLiveDetailPlayback = useCallback(
    async (showError = false) => {
      if (!selectedLive || data?.channel?.isLink) {
        return false;
      }

      try {
        const nextData = await getHomeLiveVideo(
          channelId,
          selectedLive.roomName,
          selectedLive.commentatorId,
        );

        setData(nextData);
        setIsPlaybackSourceReady(true);
        setPlayerRestoreKey((currentKey) => currentKey + 1);
        stopPlaybackRetry();
        handlePlaybackReady();

        return true;
      } catch (requestError) {
        if (showError) {
          handlePlaybackError(
            requestError instanceof Error
              ? requestError.message
              : "Không thể làm mới video live",
          );
        }

        return false;
      }
    },
    [
      channelId,
      data?.channel?.isLink,
      handlePlaybackError,
      handlePlaybackReady,
      selectedLive,
      stopPlaybackRetry,
    ],
  );

  const runPlaybackRetry = useCallback(
    function retryPlayback() {
      if (!playbackRetryActiveRef.current) {
        return;
      }

      void refreshLiveDetailPlayback(true).finally(() => {
        if (!playbackRetryActiveRef.current) {
          return;
        }

        playbackRetryTimeoutRef.current = window.setTimeout(
          retryPlayback,
          playbackRefreshRetryMs,
        );
      });
    },
    [refreshLiveDetailPlayback],
  );

  const handlePlayerPlaybackError = useCallback(
    (message: string) => {
      handlePlaybackError(message);

      if (playbackRetryActiveRef.current) {
        return;
      }

      playbackRetryActiveRef.current = true;
      runPlaybackRetry();
    },
    [handlePlaybackError, runPlaybackRetry],
  );

  const handlePlayerPlaybackReady = useCallback(() => {
    stopPlaybackRetry();
    handlePlaybackReady();
  }, [handlePlaybackReady, stopPlaybackRetry]);

  useEffect(() => {
    let isActive = true;

    async function loadLiveDetailData() {
      setIsLiveDetailLoading(true);

      try {
        const [nextData, nextHotLiveVideos, nextLiveRoomSettings] =
          await Promise.all([
            getHomeLiveVideo(
              channelId,
              initialRoomName,
              initialSelectedCommentatorId,
            ),
            getHomeHotLiveVideos({
              limit: 8,
              startTimeFrom: getTodayStartISOString(),
              startTimeTo: getTodayEndISOString(),
              status: "live",
            }),
            getLiveRoomSettings(),
          ]);

        if (!isActive) {
          return;
        }

        setData(nextData);
        setHotLiveItems(nextHotLiveVideos.items || []);
        setLiveRoomSettings(nextLiveRoomSettings);
      } catch (requestError) {
        console.error("live detail client request failed", requestError);
        if (isActive) {
          setData(null);
        }
      } finally {
        if (isActive) {
          setIsLiveDetailLoading(false);
        }
      }
    }

    void loadLiveDetailData();

    return () => {
      isActive = false;
    };
  }, [channelId, initialRoomName, initialSelectedCommentatorId]);

  useEffect(() => {
    if (!didApplyInitialDataRef.current) {
      didApplyInitialDataRef.current = true;
      return;
    }

    setData(initialData || null);
    setIsPlaybackSourceReady(false);
    setPlayerRestoreKey((currentKey) => currentKey + 1);
  }, [initialData]);

  useEffect(() => {
    if (!initialSelectedCommentatorId) {
      setSelectedLiveIndex(0);
      return;
    }

    const matchedIndex = liveOptions.findIndex(
      (option) => option.commentatorId === initialSelectedCommentatorId,
    );

    setSelectedLiveIndex(matchedIndex >= 0 ? matchedIndex : 0);
  }, [data?.channel?._id, initialSelectedCommentatorId, liveOptions]);

  useEffect(() => {
    if (selectedLiveIndex >= liveOptions.length) {
      setSelectedLiveIndex(0);
    }
  }, [liveOptions.length, selectedLiveIndex]);

  useEffect(() => {
    setIsPlaybackSourceReady(Boolean(selectedLive || data?.channel?.isLink));
  }, [data?.channel?.isLink, selectedLive]);

  useEffect(() => {
    return () => stopPlaybackRetry();
  }, [selectedLiveKey, stopPlaybackRetry]);

  const match = data?.match;
  const live = selectedLive || data?.channel?.live;
  const isIdolLive = match ? isIdolMatch(match) : false;
  const commentatorAvatarUrl = isIdolLive
    ? live?.commentatorAvatarUrl || data?.channel?.commentatorAvatarUrls?.[0]
    : undefined;
  const videoUrl =
    getLivePlaybackUrl(live, data?.channel?.isLink) ||
    data?.authorizedPlaybackUrl ||
    data?.videoUrl ||
    undefined;
  const playbackVideoUrl = isPlaybackSourceReady ? videoUrl : undefined;
  const coverImage =
    getAssetImageUrl(
      data?.liveBackgroundImageUrl || match?.liveBackgroundImageUrl,
    ) || "/assets/bg-sports.jpg";
  const handleSelectCommentator = (index: number) => {
    const nextLive = liveOptions[index];

    setSelectedLiveIndex(index);

    const nextSearchParams = new URLSearchParams(searchParams?.toString() || "");

    if (nextLive?.commentatorId) {
      nextSearchParams.set("commentatorId", nextLive.commentatorId);
      nextSearchParams.delete("blvId");
    } else {
      nextSearchParams.delete("commentatorId");
      nextSearchParams.delete("blvId");
    }

    const currentPathname = pathname || "";
    const nextSearch = nextSearchParams.toString();
    router.replace(nextSearch ? `${currentPathname}?${nextSearch}` : currentPathname, {
      scroll: false,
    });
  };

  return (
    <main className="min-h-screen bg-[#111] text-white">
      <div className="mx-auto grid max-w-[1920px] grid-cols-1 pt-[60px] 2xl:grid-cols-[250px_minmax(0,1fr)]">
        <div className="hidden 2xl:block">
          <HomeSidebar customerSupportUrl={liveRoomSettings.customerSupportUrl} />
        </div>
        <div className="min-w-0 px-3 pb-20 pt-[15px] sm:px-5 lg:px-7 2xl:px-5">
          {error ? (
            <div className="rounded-[8px] border border-[#ff8c13] bg-[#242424] p-6 text-center text-[#ff8c13]">
              {error}
            </div>
          ) : isLiveDetailLoading && !data ? (
            <div className="rounded-[8px] border border-[#ff8c13] bg-[#242424] p-6 text-center text-[#ff8c13]">
              Đang tải phòng live...
            </div>
          ) : (
            <div className="grid items-start gap-[20px] lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="min-w-0">
                <div ref={liveMediaContentRef}>
                  <LiveHeaderComponent
                    avatarUrl={commentatorAvatarUrl}
                    commentator={live?.commentatorName || data?.channel?.title}
                    matchTitle={
                      match?.title ||
                      `${match?.homeTeamName || "Live"} - ${
                        match?.awayTeamName || ""
                      }`
                    }
                    roomName={live?.roomName || data?.channel?._id}
                    viewerCount={data?.channel?.viewerCount}
                    commentatorId={live?.commentatorId}
                    commentatorOptions={liveOptions}
                    selectedCommentatorIndex={selectedLiveIndex}
                    onSelectCommentator={handleSelectCommentator}
                  />
                  <div className="relative overflow-hidden rounded-b-[8px] bg-[#252525]">
                    <div
                      ref={videoContainerRef}
                      className={`live-detail-video-shell relative aspect-[16/9] w-full bg-black ${
                        isPseudoVideoFullscreen ? "is-pseudo-fullscreen" : ""
                      }`}
                    >
                      <div className="live-detail-video-frame absolute inset-0 bg-black">
                        <div className="absolute inset-0 z-0">
                          <LiveVideoPlayer
                            key={`${selectedLiveKey}-${playbackVideoUrl || "empty"}-${playerRestoreKey}`}
                            ref={videoPlayerRef}
                            className="h-full w-full"
                            onPlaybackError={handlePlayerPlaybackError}
                            onPlaybackLoading={handlePlaybackLoading}
                            onPlaybackReady={handlePlayerPlaybackReady}
                            src={playbackVideoUrl}
                            poster={coverImage}
                            muted={desiredVideoMuted}
                            onMutedStateChange={handleMutedStateChange}
                            volume={videoVolume}
                          />
                        </div>
                        {!playbackVideoUrl && !videoUrl ? (
                          <Image
                            src={coverImage}
                            alt=""
                            fill
                            className="z-[1] object-cover"
                            sizes="(min-width: 1536px) 1250px, 100vw"
                            unoptimized={false}
                          />
                        ) : null}
                        {playbackError ? (
                          <div className="absolute left-4 right-4 top-4 z-[30] rounded bg-black/70 px-3 py-2 text-[12px] font-medium text-white">
                            {playbackError}
                          </div>
                        ) : null}
                        {playbackVideoUrl && isVideoLoading ? (
                          <div className="absolute inset-0 z-[18] flex items-center justify-center bg-black/25">
                            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          </div>
                        ) : null}
                        {!playbackVideoUrl ? (
                          <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black px-6 text-center text-[13px] font-medium text-white/75">
                            {videoUrl ? "Đang kết nối video live..." : "Chưa có video live để phát"}
                          </div>
                        ) : null}
                        <LiveVideoControlsComponent
                          isMuted={isVideoMuted}
                          isPaused={isVideoPaused}
                          isFullscreen={isVideoFullscreen}
                          isVideoAvailable={Boolean(playbackVideoUrl)}
                          volume={videoVolume}
                          onToggleMuted={handleToggleMuted}
                          onTogglePlay={handleTogglePlay}
                          onToggleFullscreen={handleToggleFullscreen}
                          onVolumeChange={handleVolumeChange}
                        />
                      </div>
                    </div>
                    <GiftStripComponent />
                  </div>
                </div>
              </section>
              <LiveChatPanelComponent
                key={chatRoomId}
                chatPanelHeight={chatPanelHeight}
                channelId={chatRoomId}
                initialMessages={chatInitialMessages}
                liveRoomSettings={liveRoomSettings}
              />
              <section className="min-w-0 lg:col-start-1">
                <HotLiveSection initialItems={hotLiveItems} />
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
