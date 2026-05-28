"use client";

import Hls from "hls.js";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type LiveVideoPlayerHandle = {
  requestNativeFullscreen: () => boolean;
  setVolume: (volume: number) => void;
  toggleMuted: () => boolean;
  togglePlay: () => boolean;
};

type LiveVideoPlayerProps = {
  className?: string;
  muted?: boolean;
  onPlaybackError?: (message: string) => void;
  onPlaybackLoading?: () => void;
  onPlaybackReady?: () => void;
  onPlaybackStateChange?: (isPaused: boolean) => void;
  onMutedStateChange?: (isMuted: boolean) => void;
  src?: string;
  poster?: string;
  volume?: number;
};

type NativeFullscreenVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

const normalizeVolume = (volume: number) => Math.min(Math.max(volume, 0), 1);

const isHlsSource = (src: string) => src.split("?")[0].toLowerCase().endsWith(".m3u8");

const canPlayNativeHls = (video: HTMLVideoElement) =>
  Boolean(
    video.canPlayType("application/vnd.apple.mpegurl") ||
      video.canPlayType("application/x-mpegURL"),
  );

const applyAudioState = (video: HTMLVideoElement, muted: boolean, volume: number) => {
  const normalizedVolume = normalizeVolume(volume);
  video.volume = normalizedVolume;
  video.muted = muted || normalizedVolume <= 0;
};

const liveEdgeSafeDelaySeconds = 3;
const maxResumeLiveLatencySeconds = 10;
const playbackLoadingDelayMs = 700;
const bufferingLoadingDelayMs = 1500;
const playbackWatchdogIntervalMs = 1000;
const playbackStallRecoveryMs = 3000;

const getStableLivePosition = (video: HTMLVideoElement, hls?: Hls | null) => {
  const hlsLiveSyncPosition = hls?.liveSyncPosition;
  if (
    typeof hlsLiveSyncPosition === "number" &&
    Number.isFinite(hlsLiveSyncPosition) &&
    hlsLiveSyncPosition > 0
  ) {
    return hlsLiveSyncPosition;
  }

  const seekable = video.seekable;
  if (!seekable.length) {
    return undefined;
  }

  const liveEdge = seekable.end(seekable.length - 1);
  if (Number.isFinite(liveEdge) && liveEdge > 0) {
    return Math.max(liveEdge - liveEdgeSafeDelaySeconds, 0);
  }

  return undefined;
};

const seekToStableLivePosition = (
  video: HTMLVideoElement,
  hls?: Hls | null,
  { force = false } = {},
) => {
  const livePosition = getStableLivePosition(video, hls);
  if (typeof livePosition !== "number") {
    return;
  }

  if (!force && Math.abs(livePosition - video.currentTime) < maxResumeLiveLatencySeconds) {
    return;
  }

  video.currentTime = livePosition;
};

const LiveVideoPlayer = forwardRef<LiveVideoPlayerHandle, LiveVideoPlayerProps>(
  function LiveVideoPlayer(
    {
      className = "",
      muted = true,
      onPlaybackError,
      onPlaybackLoading,
      onPlaybackReady,
      onPlaybackStateChange,
      onMutedStateChange,
      src,
      volume = 1,
    },
    ref,
  ) {
    const videoRef = useRef<NativeFullscreenVideo | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const loadingTimeoutRef = useRef<number | undefined>(undefined);
    const audioStateRef = useRef({ muted, volume });
    const lastPlaybackProgressRef = useRef({
      currentTime: 0,
      checkedAt: 0,
    });
    const manuallyPausedRef = useRef(false);
    const callbacksRef = useRef({
      onPlaybackError,
      onPlaybackLoading,
      onPlaybackReady,
      onPlaybackStateChange,
      onMutedStateChange,
    });

    const destroyHls = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };

    const clearPlaybackLoading = useCallback(() => {
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = undefined;
      }
    }, []);

    const schedulePlaybackLoading = useCallback((delayMs = playbackLoadingDelayMs) => {
      clearPlaybackLoading();
      loadingTimeoutRef.current = window.setTimeout(() => {
        const video = videoRef.current;
        if (!video || video.paused || video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
          return;
        }

        callbacksRef.current.onPlaybackLoading?.();
      }, delayMs);
    }, [clearPlaybackLoading]);

    const playVideo = useCallback(
      ({ forceMuted = false, syncToLive = false } = {}) => {
        const video = videoRef.current;
        if (!video || !src) {
          return;
        }

        applyAudioState(
          video,
          forceMuted ? true : audioStateRef.current.muted,
          audioStateRef.current.volume,
        );
        seekToStableLivePosition(video, hlsRef.current, { force: syncToLive });
        schedulePlaybackLoading();
        video
          .play()
          .then(() => {
            callbacksRef.current.onMutedStateChange?.(video.muted);
          })
          .catch(() => {
            if (!forceMuted && !audioStateRef.current.muted) {
              applyAudioState(video, true, audioStateRef.current.volume);
              callbacksRef.current.onMutedStateChange?.(true);
              void video.play().catch(() => {
                callbacksRef.current.onPlaybackReady?.();
              });
              return;
            }

            callbacksRef.current.onPlaybackReady?.();
          });
      },
      [schedulePlaybackLoading, src],
    );

    useImperativeHandle(
      ref,
      () => ({
        requestNativeFullscreen: () => {
          const video = videoRef.current;
          if (!video?.webkitEnterFullscreen) {
            return false;
          }

          try {
            video.webkitEnterFullscreen();
            return true;
          } catch {
            return false;
          }
        },
        setVolume: (nextVolume: number) => {
          const video = videoRef.current;
          const normalizedVolume = normalizeVolume(nextVolume);
          audioStateRef.current = {
            muted: normalizedVolume <= 0,
            volume: normalizedVolume,
          };

          if (video) {
            applyAudioState(video, normalizedVolume <= 0, normalizedVolume);
            callbacksRef.current.onMutedStateChange?.(video.muted);
          }
        },
        toggleMuted: () => {
          const video = videoRef.current;
          if (!video) {
            return audioStateRef.current.muted;
          }

          const nextMuted = !video.muted;
          audioStateRef.current = {
            ...audioStateRef.current,
            muted: nextMuted,
          };
          applyAudioState(video, nextMuted, audioStateRef.current.volume || 1);
          callbacksRef.current.onMutedStateChange?.(video.muted);

          return video.muted;
        },
        togglePlay: () => {
          const video = videoRef.current;
          if (!video) {
            return true;
          }

          if (manuallyPausedRef.current) {
            manuallyPausedRef.current = false;
            playVideo();
            return false;
          }

          manuallyPausedRef.current = true;
          video.pause();
          callbacksRef.current.onPlaybackReady?.();
          callbacksRef.current.onPlaybackStateChange?.(true);
          return true;
        },
      }),
      [playVideo],
    );

    useEffect(() => {
      callbacksRef.current = {
        onPlaybackError,
        onPlaybackLoading,
        onPlaybackReady,
        onPlaybackStateChange,
        onMutedStateChange,
      };
    }, [
      onMutedStateChange,
      onPlaybackError,
      onPlaybackLoading,
      onPlaybackReady,
      onPlaybackStateChange,
    ]);

    useEffect(() => {
      audioStateRef.current = { muted, volume };

      const video = videoRef.current;
      if (!video) {
        return;
      }

      applyAudioState(video, muted, volume);
      callbacksRef.current.onMutedStateChange?.(video.muted);
    }, [muted, volume]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      destroyHls();
      manuallyPausedRef.current = false;
      lastPlaybackProgressRef.current = {
        currentTime: 0,
        checkedAt: Date.now(),
      };
      video.pause();
      video.removeAttribute("src");
      video.load();

      if (!src) {
        callbacksRef.current.onPlaybackStateChange?.(true);
        return;
      }

      callbacksRef.current.onPlaybackLoading?.();
      applyAudioState(
        video,
        audioStateRef.current.muted,
        audioStateRef.current.volume,
      );
      callbacksRef.current.onMutedStateChange?.(video.muted);

      if (isHlsSource(src) && Hls.isSupported() && !canPlayNativeHls(video)) {
        const hls = new Hls({
          backBufferLength: 30,
          liveSyncDurationCount: 3,
        });
        hls.attachMedia(video);
        hls.loadSource(src);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          playVideo({ syncToLive: true });
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            schedulePlaybackLoading(0);
            hls.startLoad();
            return;
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            schedulePlaybackLoading(0);
            hls.recoverMediaError();
            playVideo({ forceMuted: true, syncToLive: true });
            return;
          }

          callbacksRef.current.onPlaybackError?.("Không thể phát video live");
        });
        hlsRef.current = hls;
      } else {
        video.src = src;
        video.load();
        playVideo({ syncToLive: true });
      }

      return () => {
        destroyHls();
      };
    }, [playVideo, src]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !src) {
        return;
      }

      const recoverPlayback = ({ syncToLive = false } = {}) => {
        if (manuallyPausedRef.current || !src) {
          return;
        }

        callbacksRef.current.onPlaybackLoading?.();

        const hls = hlsRef.current;
        if (hls) {
          hls.startLoad();
        } else if (video.networkState === HTMLMediaElement.NETWORK_IDLE) {
          video.load();
        }

        playVideo({ forceMuted: true, syncToLive });
      };

      const handleForegroundRestore = () => {
        if (document.visibilityState === "hidden") {
          return;
        }

        recoverPlayback({ syncToLive: true });
      };

      const interval = window.setInterval(() => {
        if (document.visibilityState === "hidden" || manuallyPausedRef.current) {
          return;
        }

        if (video.paused || video.ended) {
          recoverPlayback({ syncToLive: true });
          return;
        }

        const now = Date.now();
        const lastProgress = lastPlaybackProgressRef.current;
        const hasAdvanced = Math.abs(video.currentTime - lastProgress.currentTime) > 0.25;

        if (hasAdvanced) {
          lastPlaybackProgressRef.current = {
            currentTime: video.currentTime,
            checkedAt: now,
          };
          return;
        }

        if (now - lastProgress.checkedAt >= playbackStallRecoveryMs) {
          recoverPlayback({ syncToLive: true });
          lastPlaybackProgressRef.current = {
            currentTime: video.currentTime,
            checkedAt: now,
          };
        }
      }, playbackWatchdogIntervalMs);

      window.addEventListener("pageshow", handleForegroundRestore);
      document.addEventListener("visibilitychange", handleForegroundRestore);

      return () => {
        window.clearInterval(interval);
        window.removeEventListener("pageshow", handleForegroundRestore);
        document.removeEventListener("visibilitychange", handleForegroundRestore);
      };
    }, [playVideo, schedulePlaybackLoading, src]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      const handlePlaying = () => {
        lastPlaybackProgressRef.current = {
          currentTime: video.currentTime,
          checkedAt: Date.now(),
        };
        clearPlaybackLoading();
        callbacksRef.current.onPlaybackReady?.();
        callbacksRef.current.onPlaybackStateChange?.(false);
      };
      const handlePause = () => {
        clearPlaybackLoading();
        callbacksRef.current.onPlaybackReady?.();
        if (!manuallyPausedRef.current) {
          return;
        }

        callbacksRef.current.onPlaybackStateChange?.(true);
      };
      const handleError = () => {
        clearPlaybackLoading();
        callbacksRef.current.onPlaybackReady?.();
        callbacksRef.current.onPlaybackError?.("Không thể phát video live");
      };
      const handleWaiting = () => {
        if (video.paused || manuallyPausedRef.current) {
          return;
        }

        schedulePlaybackLoading(bufferingLoadingDelayMs);
      };
      const handleReadyStateImproved = () => {
        clearPlaybackLoading();
        callbacksRef.current.onPlaybackReady?.();
      };
      const handleProgress = () => {
        lastPlaybackProgressRef.current = {
          currentTime: video.currentTime,
          checkedAt: Date.now(),
        };
      };

      video.addEventListener("playing", handlePlaying);
      video.addEventListener("timeupdate", handleProgress);
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("loadstart", handleWaiting);
      video.addEventListener("stalled", handleWaiting);
      video.addEventListener("seeking", handleWaiting);
      video.addEventListener("canplay", handleReadyStateImproved);
      video.addEventListener("loadeddata", handleReadyStateImproved);
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handlePause);
      video.addEventListener("error", handleError);

      return () => {
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("timeupdate", handleProgress);
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("loadstart", handleWaiting);
        video.removeEventListener("stalled", handleWaiting);
        video.removeEventListener("seeking", handleWaiting);
        video.removeEventListener("canplay", handleReadyStateImproved);
        video.removeEventListener("loadeddata", handleReadyStateImproved);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handlePause);
        video.removeEventListener("error", handleError);
        clearPlaybackLoading();
      };
    }, [clearPlaybackLoading, schedulePlaybackLoading]);

    return (
      <div className={`relative h-full w-full overflow-hidden bg-transparent ${className}`}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          className="okw-live-player h-full w-full"
          x5-playsinline="true"
          x5-video-player-fullscreen="true"
          x5-video-player-type="h5"
          webkit-playsinline="true"
        />
      </div>
    );
  },
);

export default LiveVideoPlayer;
