import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveVideoPlayerHandle } from "@/components/video/LiveVideoPlayer";

const videoAudioPreferenceKey = "okwin_video_audio_preference";

const getInitialVideoAudioPreference = () => {
  if (typeof window === "undefined") {
    return { muted: false, volume: 1 };
  }

  try {
    const rawPreference = window.sessionStorage.getItem(videoAudioPreferenceKey);
    if (!rawPreference) {
      return { muted: false, volume: 1 };
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
      muted: false,
      volume,
    };
  } catch {
    return { muted: false, volume: 1 };
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

export function useLiveDetailVideo(dataDependency: unknown) {
  const initialAudioPreference = getInitialVideoAudioPreference();
  const [playbackError, setPlaybackError] = useState("");
  const [desiredVideoMuted, setDesiredVideoMuted] = useState(
    () => initialAudioPreference.muted,
  );
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [videoVolume, setVideoVolume] = useState(() => initialAudioPreference.volume);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [isPseudoVideoFullscreen, setIsPseudoVideoFullscreen] = useState(false);
  const [chatPanelHeight, setChatPanelHeight] = useState<number | undefined>();
  const videoPlayerRef = useRef<LiveVideoPlayerHandle | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const liveMediaContentRef = useRef<HTMLDivElement | null>(null);

  const syncFullscreenState = useCallback(
    (nextPseudoFullscreen: boolean) => {
      setIsVideoFullscreen(
        document.fullscreenElement === videoContainerRef.current ||
          nextPseudoFullscreen,
      );
    },
    [],
  );

  const handleTogglePlay = useCallback(() => {
    const nextPaused = videoPlayerRef.current?.togglePlay();
    if (typeof nextPaused === "boolean") {
      setIsVideoPaused(nextPaused);
      setIsVideoLoading(!nextPaused);
    }
  }, []);

  const handleToggleMuted = useCallback(() => {
    const nextMuted = videoPlayerRef.current?.toggleMuted();
    if (typeof nextMuted === "boolean") {
      setIsVideoMuted(nextMuted);
      setDesiredVideoMuted(nextMuted);
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
    setDesiredVideoMuted(normalizedVolume <= 0);
    videoPlayerRef.current?.setVolume(normalizedVolume);
    persistVideoAudioPreference(normalizedVolume <= 0, normalizedVolume);
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    const videoContainer = videoContainerRef.current;

    if (!videoContainer) {
      return;
    }

    try {
      if (isPseudoVideoFullscreen) {
        setIsPseudoVideoFullscreen(false);
        return;
      }

      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await videoContainer.requestFullscreen();
    } catch {
      const didUseNativeVideoFullscreen =
        videoPlayerRef.current?.requestNativeFullscreen();
      if (didUseNativeVideoFullscreen) {
        setIsVideoFullscreen(true);
        return;
      }

      setIsPseudoVideoFullscreen(true);
    }
  }, [isPseudoVideoFullscreen]);

  const handlePlaybackError = useCallback((message: string) => {
    setPlaybackError(message);
    setIsVideoLoading(false);
  }, []);

  const handlePlaybackLoading = useCallback(() => {
    setPlaybackError("");
    setIsVideoLoading(true);
  }, []);

  const handlePlaybackReady = useCallback(() => {
    setPlaybackError("");
    setIsVideoLoading(false);
  }, []);

  const handleMutedStateChange = useCallback((nextMuted: boolean) => {
    setIsVideoMuted(nextMuted);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () =>
      syncFullscreenState(isPseudoVideoFullscreen);

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isPseudoVideoFullscreen, syncFullscreenState]);

  useEffect(() => {
    const videoContainer = videoContainerRef.current;
    const nativeVideo = videoContainer?.querySelector("video");
    if (!nativeVideo) {
      return;
    }

    const handleNativeFullscreenStart = () => setIsVideoFullscreen(true);
    const handleNativeFullscreenEnd = () => syncFullscreenState(false);

    nativeVideo.addEventListener(
      "webkitbeginfullscreen",
      handleNativeFullscreenStart,
    );
    nativeVideo.addEventListener("webkitendfullscreen", handleNativeFullscreenEnd);

    return () => {
      nativeVideo.removeEventListener(
        "webkitbeginfullscreen",
        handleNativeFullscreenStart,
      );
      nativeVideo.removeEventListener(
        "webkitendfullscreen",
        handleNativeFullscreenEnd,
      );
    };
  }, [dataDependency, syncFullscreenState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPseudoVideoFullscreen(false);
      }
    };

    document.body.classList.toggle(
      "live-detail-video-body-locked",
      isPseudoVideoFullscreen,
    );
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("live-detail-video-body-locked");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPseudoVideoFullscreen]);

  useEffect(() => {
    setPlaybackError("");
    setIsVideoPaused(false);
    setIsVideoMuted(true);
    setIsVideoLoading(true);
    setIsPseudoVideoFullscreen(false);
    syncFullscreenState(false);
  }, [dataDependency, syncFullscreenState]);

  useEffect(() => {
    const mediaContent = liveMediaContentRef.current;

    if (!mediaContent) {
      return;
    }

    const desktopMediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateChatPanelHeight = () => {
      if (!desktopMediaQuery.matches) {
        setChatPanelHeight(undefined);
        return;
      }

      setChatPanelHeight(Math.ceil(mediaContent.getBoundingClientRect().height));
    };
    const resizeObserver = new ResizeObserver(updateChatPanelHeight);

    resizeObserver.observe(mediaContent);
    updateChatPanelHeight();
    desktopMediaQuery.addEventListener("change", updateChatPanelHeight);
    window.addEventListener("resize", updateChatPanelHeight);

    return () => {
      resizeObserver.disconnect();
      desktopMediaQuery.removeEventListener("change", updateChatPanelHeight);
      window.removeEventListener("resize", updateChatPanelHeight);
    };
  }, [dataDependency]);

  return {
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
  };
}
