"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LiveVideoPlayerHandle } from "@/components/video/LiveVideoPlayer";
import type {
  HomeLiveVideoItem,
  HomeLiveVideoResponse,
  LiveMatch,
} from "@/models/match";
import {
  buildLiveDetailHref,
  getMatchCategoryKind,
  getTodayEndISOString,
  getTodayStartISOString,
} from "@/helpers/string";
import { getHomeLivePlaybackUrl } from "@/helpers/livePlayback";
import { getAssetImageUrl } from "@/services/homeAssets";
import {
  getHomeHotLiveVideos,
  getHomeLiveVideo,
  getHomeLiveVideos,
} from "@/services/matches";
import { homeCategories, type SectionKind } from "../components/homeData";

const panelIconBasePath = "/assets/icon_video_pannel";
const videoAudioPreferenceKey = "okwin_video_audio_preference";
const playbackRefreshRetryMs = 30000;

const getInitialVideoAudioPreference = () => {
  if (typeof window === "undefined") {
    return { muted: true, volume: 1 };
  }

  try {
    const rawPreference = window.sessionStorage.getItem(videoAudioPreferenceKey);
    if (!rawPreference) {
      return { muted: true, volume: 1 };
    }

    const preference = JSON.parse(rawPreference) as {
      muted?: unknown;
      volume?: unknown;
    };
    const volume =
      typeof preference.volume === "number"
        ? Math.min(Math.max(preference.volume, 0), 1)
        : 1;

    return {
      muted: true,
      volume,
    };
  } catch {
    return { muted: true, volume: 1 };
  }
};

const persistVideoAudioPreference = (muted: boolean, volume: number) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    videoAudioPreferenceKey,
    JSON.stringify({ muted, volume }),
  );
};

export type CategoryPanelTab = {
  id: string;
  label: string;
  kind: SectionKind;
  iconSrc: string;
};

export type PanelMatch = LiveMatch & {
  categoryBackgroundImage?: string;
  categoryKind?: SectionKind;
};

export type PanelLiveItem = HomeLiveVideoItem & {
  match: PanelMatch;
};

const categoryTabs = [
  {
    id: "hot",
    label: "Hot",
    kind: "hot",
    iconSrc: `${panelIconBasePath}/Group.svg`,
  },
  ...homeCategories.map((category) => ({
    id: category.id,
    label: category.apiCategoryName,
    kind: category.kind,
    iconSrc:
      category.id === "sports"
        ? `${panelIconBasePath}/Frame-1.svg`
        : category.id === "esports"
        ? `${panelIconBasePath}/Vector-2.svg`
        : category.id === "casino"
        ? `${panelIconBasePath}/Frame.svg`
        : `${panelIconBasePath}/Frame-2.svg`,
  })),
] satisfies CategoryPanelTab[];

export function useHomeHeroSection({
  initialBannerImageUrls,
  initialPanelLiveItems,
}: {
  initialBannerImageUrls: string[];
  initialPanelLiveItems?: HomeLiveVideoItem[];
}) {
  const hasInitialPanelLiveItems = Boolean(initialPanelLiveItems?.length);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const videoPlayerRef = useRef<LiveVideoPlayerHandle | null>(null);
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(
    () => getInitialVideoAudioPreference().muted,
  );
  const [videoVolume, setVideoVolume] = useState(
    () => getInitialVideoAudioPreference().volume,
  );
  const [playerRestoreKey, setPlayerRestoreKey] = useState(0);
  const [panelLiveItems, setPanelLiveItems] = useState<PanelLiveItem[]>(() =>
    mapHomeLiveVideoItemsToPanelItems(initialPanelLiveItems || []),
  );
  const [panelMatchesError, setPanelMatchesError] = useState("");
  const [isPanelMatchesLoading, setIsPanelMatchesLoading] = useState(false);
  const [isActiveVideoLoading, setIsActiveVideoLoading] = useState(false);
  const [activeVideoItem, setActiveVideoItem] = useState<PanelLiveItem | null>(
    () =>
      mapHomeLiveVideoItemsToPanelItems(initialPanelLiveItems || [])[0] || null,
  );
  const selectRequestRef = useRef(0);
  const hasAutoSelectedInitialHotRef = useRef(
    hasInitialPanelLiveItems,
  );
  const shouldUseInitialPanelItemsRef = useRef(
    hasInitialPanelLiveItems,
  );
  const [playbackError, setPlaybackError] = useState<{
    message: string;
    src?: string;
  } | null>(null);
  const refreshRequestRef = useRef(0);
  const playbackRetryActiveRef = useRef(false);
  const playbackRetryTimeoutRef = useRef<number | undefined>(undefined);

  const stopPlaybackRetry = useCallback(() => {
    playbackRetryActiveRef.current = false;
    if (playbackRetryTimeoutRef.current) {
      window.clearTimeout(playbackRetryTimeoutRef.current);
      playbackRetryTimeoutRef.current = undefined;
    }
  }, []);

  const videoUrl = getHomeLivePlaybackUrl(activeVideoItem);
  const activeLiveDetailHref = activeVideoItem
    ? buildLiveDetailHref(activeVideoItem, activeVideoItem.channel.live.commentatorId)
    : "";
  const activeBannerSafeIndex = initialBannerImageUrls.length
    ? activeBannerIndex % initialBannerImageUrls.length
    : 0;
  const activeBannerUrl = useMemo(
    () => getAssetImageUrl(initialBannerImageUrls[activeBannerSafeIndex]),
    [activeBannerSafeIndex, initialBannerImageUrls],
  );
  const selectedCategoryTab =
    categoryTabs.find((tab) => tab.id === activeCategoryId) || categoryTabs[0];
  const activeCategoryKind = selectedCategoryTab?.kind || "hot";
  const panelCategoryName =
    activeCategoryKind === "hot" ? undefined : selectedCategoryTab?.label;
  const visiblePlaybackError =
    playbackError && playbackError.src === videoUrl
      ? playbackError.message
      : null;

  const refreshActiveVideoPlayback = useCallback(
    async ({
      restorePlayer = false,
      showError = false,
    }: {
      restorePlayer?: boolean;
      showError?: boolean;
    } = {}) => {
      const item = activeVideoItem;
      if (!item || item.channel.isLink) {
        return false;
      }

      const live = item.channel.live;
      if (!item.channel._id || !live?.roomName) {
        return false;
      }

      const requestId = refreshRequestRef.current + 1;
      refreshRequestRef.current = requestId;
      const previousUrl = getHomeLivePlaybackUrl(item);

      try {
        const response = await getHomeLiveVideo(
          item.channel._id,
          live.roomName,
          live.commentatorId,
        );

        if (refreshRequestRef.current !== requestId) {
          return false;
        }

        setActiveVideoItem((currentItem) => {
          if (
            !currentItem ||
            currentItem.id !== item.id ||
            currentItem.channel.live.roomName !== live.roomName ||
            currentItem.channel.live.commentatorId !== live.commentatorId
          ) {
            return currentItem;
          }

          return mapHomeLiveVideoResponseToPanelItem(response, currentItem) || currentItem;
        });
        setPlaybackError(null);
        if (restorePlayer) {
          setPlayerRestoreKey((currentKey) => currentKey + 1);
        }

        return true;
      } catch (error) {
        if (showError && refreshRequestRef.current === requestId) {
          setPlaybackError({
            message:
              error instanceof Error ? error.message : "KhÃ´ng thá»ƒ lÃ m má»›i video live",
            src: previousUrl,
          });
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

      void refreshActiveVideoPlayback({ showError: true }).finally(() => {
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

  const handlePlaybackError = useCallback(
    (message: string) => {
      setIsActiveVideoLoading(false);
      setPlaybackError({ message, src: videoUrl });

      if (playbackRetryActiveRef.current) {
        return;
      }

      playbackRetryActiveRef.current = true;
      runPlaybackRetry();
    },
    [runPlaybackRetry, videoUrl],
  );
  const handlePlaybackReady = useCallback(() => {
    stopPlaybackRetry();
    setIsActiveVideoLoading(false);
    setPlaybackError(null);
  }, [stopPlaybackRetry]);
  const handlePlaybackLoading = useCallback(() => {
    setPlaybackError(null);
    setIsActiveVideoLoading(true);
  }, []);
  const handlePlaybackStateChange = useCallback((isPaused: boolean) => {
    setIsVideoPaused(isPaused);
  }, []);

  const handleTogglePlay = useCallback(() => {
    const nextPaused = videoPlayerRef.current?.togglePlay();
    if (typeof nextPaused === "boolean") {
      setIsVideoPaused(nextPaused);
      setIsActiveVideoLoading(!nextPaused);
    }
  }, []);

  const handleToggleMuted = useCallback(() => {
    const nextMuted = videoPlayerRef.current?.toggleMuted();
    if (typeof nextMuted === "boolean") {
      setIsVideoMuted(nextMuted);
      if (!nextMuted && videoVolume <= 0) {
        setVideoVolume(1);
        videoPlayerRef.current?.setVolume(1);
        persistVideoAudioPreference(false, 1);
        return;
      }

      persistVideoAudioPreference(nextMuted, videoVolume);
    }
  }, [videoVolume]);

  const handleVolumeChange = useCallback((nextVolume: number) => {
    const normalizedVolume = Math.min(Math.max(nextVolume, 0), 1);

    setVideoVolume(normalizedVolume);
    setIsVideoMuted(normalizedVolume <= 0);
    videoPlayerRef.current?.setVolume(normalizedVolume);
    persistVideoAudioPreference(normalizedVolume <= 0, normalizedVolume);
  }, []);

  const handleSelectLiveItem = useCallback(async (item: PanelLiveItem) => {
    const requestId = selectRequestRef.current + 1;
    selectRequestRef.current = requestId;

    setActiveVideoItem(item);
    setPlaybackError(null);
    setIsVideoPaused(true);
    setIsActiveVideoLoading(true);

    try {
      const response = await getHomeLiveVideo(
        item.channel._id,
        item.channel.live.roomName,
        item.channel.live.commentatorId,
      );
      if (selectRequestRef.current !== requestId) {
        return;
      }

      setActiveVideoItem(
        mapHomeLiveVideoResponseToPanelItem(response, item) || item,
      );
    } catch (error) {
      if (selectRequestRef.current === requestId) {
        setPlaybackError({
          message:
            error instanceof Error ? error.message : "Không thể tải video live",
          src: getHomeLivePlaybackUrl(item),
        });
      }
    } finally {
      if (selectRequestRef.current === requestId) {
        setIsActiveVideoLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (initialBannerImageUrls.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveBannerIndex(
        (currentIndex) => (currentIndex + 1) % initialBannerImageUrls.length,
      );
    }, 4000);

    return () => window.clearInterval(interval);
  }, [initialBannerImageUrls.length]);

  useEffect(() => {
    return () => stopPlaybackRetry();
  }, [activeVideoItem?.id, stopPlaybackRetry]);

  useEffect(() => {
    const restorePlayer = () => {
      setPlayerRestoreKey((currentKey) => currentKey + 1);
    };

    window.addEventListener("pageshow", restorePlayer);
    window.addEventListener("popstate", restorePlayer);

    return () => {
      window.removeEventListener("pageshow", restorePlayer);
      window.removeEventListener("popstate", restorePlayer);
    };
  }, []);

  useEffect(() => {
    if (!selectedCategoryTab) {
      return;
    }

    if (activeCategoryKind === "hot" && shouldUseInitialPanelItemsRef.current) {
      shouldUseInitialPanelItemsRef.current = false;
      return;
    }

    let isActive = true;
    setIsPanelMatchesLoading(true);
    setPanelMatchesError("");

    const liveParams = {
      limit: 4,
      startTimeFrom: getTodayStartISOString(),
      startTimeTo: getTodayEndISOString(),
      status: "live" as const,
    };
    const loadPanelItems =
      activeCategoryKind === "hot"
        ? getHomeHotLiveVideos(liveParams)
        : getHomeLiveVideos({
            ...liveParams,
            categoryName: panelCategoryName,
          });

    loadPanelItems
      .then((data) => {
        if (isActive) {
          const nextItems = mapHomeLiveVideoItemsToPanelItems(data.items);
          setPanelLiveItems(nextItems);
          const shouldAutoSelectInitialHot =
            activeCategoryKind === "hot" &&
            !hasAutoSelectedInitialHotRef.current;
          if (shouldAutoSelectInitialHot) {
            hasAutoSelectedInitialHotRef.current = true;
          }

          setActiveVideoItem((currentItem) => {
            if (currentItem) {
              return currentItem;
            }

            if (shouldAutoSelectInitialHot) {
              return nextItems[0] || null;
            }

            return null;
          });
        }
      })
      .catch((error) => {
        if (isActive) {
          setPanelLiveItems([]);
          setPanelMatchesError(
            error instanceof Error ? error.message : "Không thể tải phòng live",
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsPanelMatchesLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [activeCategoryKind, panelCategoryName, selectedCategoryTab]);

  return {
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
  };
}

function mapHomeLiveVideoItemsToPanelItems(
  items: HomeLiveVideoItem[],
): PanelLiveItem[] {
  return items.map((item) => ({
    ...item,
    match: {
      ...item.match,
      categoryKind: getMatchCategoryKind(item.match),
    },
  }));
}

function mapHomeLiveVideoResponseToPanelItem(
  response: HomeLiveVideoResponse,
  fallbackItem: PanelLiveItem,
): PanelLiveItem | null {
  if (!response.match) {
    return null;
  }

  if (!response.channel?.live) {
    return {
      ...fallbackItem,
      match: {
        ...response.match,
        categoryKind: getMatchCategoryKind(response.match),
      },
      videoUrl: response.videoUrl,
      authorizedPlaybackUrl: response.authorizedPlaybackUrl,
      token: response.token || "",
      expiresAt: response.expiresAt || 0,
      liveBackgroundImageUrl: response.liveBackgroundImageUrl,
    };
  }

  return {
    id: fallbackItem.id,
    match: {
      ...response.match,
      categoryKind: getMatchCategoryKind(response.match),
    },
    channel: response.channel,
    videoUrl: response.videoUrl,
    authorizedPlaybackUrl: response.authorizedPlaybackUrl,
    token: response.token || "",
    expiresAt: response.expiresAt || 0,
    liveBackgroundImageUrl: response.liveBackgroundImageUrl,
  };
}
