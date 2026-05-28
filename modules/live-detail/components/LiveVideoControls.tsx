import Image from "next/image";
import { videoPanelIcons } from "./liveDetailAssets";

export default function LiveVideoControls({
  isMuted,
  isPaused,
  isFullscreen,
  isVideoAvailable,
  volume,
  onToggleMuted,
  onTogglePlay,
  onToggleFullscreen,
  onVolumeChange,
}: {
  isMuted: boolean;
  isPaused: boolean;
  isFullscreen: boolean;
  isVideoAvailable: boolean;
  volume: number;
  onToggleMuted: () => void;
  onTogglePlay: () => void;
  onToggleFullscreen: () => void;
  onVolumeChange: (volume: number) => void;
}) {
  const displayedVolume = isMuted ? 0 : volume;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex h-[54px] items-center justify-between bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.42)_48%,rgba(0,0,0,.84)_100%)] px-3">
      <div className="flex h-8 items-center gap-[10px] text-white">
        <button
          type="button"
          aria-label={isPaused ? "Play video" : "Pause video"}
          aria-pressed={isPaused}
          disabled={!isVideoAvailable}
          onClick={onTogglePlay}
          className="flex h-10 w-10 touch-manipulation cursor-pointer items-center justify-center rounded-full text-[22px] leading-none text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPaused ? (
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
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            aria-pressed={isMuted}
            disabled={!isVideoAvailable}
            onClick={onToggleMuted}
            className="flex h-10 w-10 touch-manipulation cursor-pointer items-center justify-center rounded-full text-[24px] leading-none text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isMuted ? (
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
          <div className="hidden w-[88px] overflow-hidden transition-[width] duration-200 sm:flex sm:w-0 sm:group-hover/volume:w-[88px] sm:group-focus-within/volume:w-[88px]">
            <input
              type="range"
              aria-label="Adjust video volume"
              min={0}
              max={100}
              step={1}
              disabled={!isVideoAvailable}
              value={Math.round(displayedVolume * 100)}
              onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
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
      <button
        type="button"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        aria-pressed={isFullscreen}
        disabled={!isVideoAvailable}
        onClick={onToggleFullscreen}
        className="flex h-10 w-10 touch-manipulation cursor-pointer items-center justify-center rounded-full text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 7.9c0-1.3 1.4-2.1 2.5-1.4l11.1 7.1c1 .6 1 2.1 0 2.8l-11.1 7.1c-1.1.7-2.5-.1-2.5-1.4V7.9Z"
        fill="white"
      />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg
      aria-hidden
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.96 6.76c.23.1.43.26.57.47.14.2.21.45.21.7v15.22c0 .25-.07.5-.21.7-.14.21-.34.37-.57.47-.23.09-.49.12-.73.07-.25-.05-.47-.17-.65-.35l-4.7-4.7H6.6c-.34 0-.66-.13-.9-.37a1.27 1.27 0 0 1-.37-.9V13c0-.34.13-.66.37-.9.24-.24.56-.37.9-.37h3.28l4.7-4.7c.18-.18.4-.3.65-.35.24-.05.5-.02.73.08Z"
        fill="white"
      />
      <path
        d="M20.65 10.6a1.27 1.27 0 0 1 1.79 0 6.96 6.96 0 0 1 0 9.88 1.27 1.27 0 1 1-1.79-1.8 4.43 4.43 0 0 0 0-6.29 1.27 1.27 0 0 1 0-1.79Z"
        fill="white"
      />
      <path
        d="M23.85 7.4a1.27 1.27 0 0 1 1.8 0 11.49 11.49 0 0 1 0 16.27 1.27 1.27 0 1 1-1.8-1.8 8.95 8.95 0 0 0 0-12.68 1.27 1.27 0 0 1 0-1.79Z"
        fill="white"
      />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg
      aria-hidden
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 13V7h6M19 7h6v6M25 19v6h-6M13 25H7v-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg
      aria-hidden
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 7v6H7M25 13h-6V7M19 25v-6h6M7 19h6v6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}
