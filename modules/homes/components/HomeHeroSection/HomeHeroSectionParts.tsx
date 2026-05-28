"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  formatMatchDate,
  formatMatchTime,
  formatViewerCount,
  getChannelStatusBadgeConfig,
  getInitials,
  getLiveFooterNames,
} from "@/helpers/string";
import { getAssetImageUrl } from "@/services/homeAssets";
import type { PanelLiveItem } from "../../hooks/useHomeHeroSection";

const footballIconSrc = "/assets/icon_video_pannel/Frame-1.svg";
const esportsIconSrc = "/assets/icon_video_pannel/Vector-2.svg";
const casinoIconSrc = "/assets/icon_video_pannel/Frame.svg";
const idolIconSrc = "/assets/icon_video_pannel/Frame-2.svg";

export function PanelState({ children }: { children: ReactNode }) {
  return (
    <div className="col-span-full flex min-h-[150px] items-center justify-center rounded-[5px] bg-[#343434] px-4 text-center text-[13px] text-[#bcbcbc]">
      {children}
    </div>
  );
}

export function PlayIcon() {
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

export function VolumeIcon() {
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

export function HeroMatchCard({
  activeCommentatorId,
  isActive,
  item,
  onSelect,
}: {
  activeCommentatorId?: string;
  isActive?: boolean;
  item: PanelLiveItem;
  onSelect: (item: PanelLiveItem) => void;
}) {
  const { match } = item;
  if (match.categoryKind === "sports" || match.categoryKind === "esports") {
    return (
      <SportsLiveCard
        activeCommentatorId={activeCommentatorId}
        item={item}
        isActive={isActive}
        onSelect={onSelect}
      />
    );
  }

  if (match.categoryKind === "casino" || match.categoryKind === "idol") {
    return (
      <VisualLiveCard
        activeCommentatorId={activeCommentatorId}
        item={item}
        isActive={isActive}
        onSelect={onSelect}
        variant={match.categoryKind}
      />
    );
  }

  const live = item.channel.live;
  const categoryName = match.categoryNames?.[0] || match.categoryName;
  const backgroundImageUrl = getAssetImageUrl(match.categoryBackgroundImage);

  return (
    <article
      role="button"
      tabIndex={0}
      className={`relative flex min-h-[150px] cursor-pointer flex-col justify-between overflow-hidden rounded-[5px] border p-[12px] text-white ${
        isActive ? "border-white opacity-60" : "border-transparent bg-[#343434]"
      }`}
      style={
        backgroundImageUrl
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.82)), url(${backgroundImageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
      onClick={() => onSelect(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item);
        }
      }}
    >
      <div className="relative z-10">
        <div className="mb-[8px] flex items-center justify-between gap-2 text-[12px] text-[#bcbcbc]">
          <span className="truncate">
            {match.tournament || categoryName || "Giải đấu"}
          </span>
          <span className="rounded bg-[#ff8c13] px-2 py-[2px] text-[11px] font-bold text-white">
            {formatMatchTime(match.startTime)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-[14px] font-bold leading-[18px]">
          {match.title || `${match.homeTeamName} vs ${match.awayTeamName}`}
        </h3>
        <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-[#ff8c13]">
          {live.liveName || item.channel.title}
        </p>
      </div>
      <div className="relative z-10 mt-[12px] grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[13px] font-semibold">
        <span className="truncate text-left">{match.homeTeamName}</span>
        <span className="rounded bg-[#242424] px-2 py-1 text-[#ff8c13]">
          {match.score || "0-0"}
        </span>
        <span className="truncate text-right">{match.awayTeamName}</span>
      </div>
    </article>
  );
}

function HeroCategoryIconBadge({ iconSrc }: { iconSrc: string }) {
  return (
    <span className="absolute left-0 top-0 z-20 flex h-5 w-8 items-center justify-center rounded-br-[10px] bg-[#f68c1f]">
      <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-white">
        <Image
          src={iconSrc}
          alt=""
          width={15}
          height={15}
          aria-hidden
          className="h-[14.6px] w-[14.6px] object-contain"
        />
      </span>
    </span>
  );
}

function VisualLiveCard({
  activeCommentatorId,
  isActive,
  item,
  onSelect,
  variant,
}: {
  activeCommentatorId?: string;
  isActive?: boolean;
  item: PanelLiveItem;
  onSelect: (item: PanelLiveItem) => void;
  variant: "casino" | "idol";
}) {
  const { match } = item;
  const live = item.channel.live;
  const fallbackImage =
    variant === "idol"
      ? "/assets/img_bg_idol.png"
      : "/assets/img_bg_casino.png";
  const fallbackHost = variant === "idol" ? "Streamer" : "BLV";
  const backgroundImageUrl =
    getAssetImageUrl(
      item.liveBackgroundImageUrl || match.liveBackgroundImageUrl
    ) || fallbackImage;
  const footerNames = getLiveFooterNames(item, fallbackHost);
  const footerAvatarUrls = getLiveFooterAvatarUrls(item);
  const categoryIconSrc = variant === "casino" ? casinoIconSrc : idolIconSrc;

  return (
    <article
      role="button"
      tabIndex={0}
      className={`relative flex min-h-[150px] cursor-pointer flex-col justify-end overflow-hidden rounded-[5px] border bg-[#050505] bg-cover bg-center text-white shadow-[0_2px_0_rgba(0,0,0,.65)] ${
        isActive ? "border-white opacity-60" : "border-[#ff8c13]"
      }`}
      onClick={() => onSelect(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item);
        }
      }}
    >
      <Image
        src={backgroundImageUrl}
        alt=""
        fill
        className="z-0 object-cover"
        sizes="(min-width: 1536px) 290px, 50vw"
        unoptimized={false}
        aria-hidden
      />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,.05)_0%,rgba(0,0,0,.1)_58%,rgba(0,0,0,.72)_100%)]" />
      <HeroCategoryIconBadge iconSrc={categoryIconSrc} />
      <ChannelStatusBadge status={item.channel.status} />
      <div className="relative z-10 flex h-[46px] items-center justify-between border-t border-[#f68c1f] bg-[linear-gradient(90deg,rgba(0,0,0,.76)_0%,rgba(32,32,32,.7)_65%,rgba(0,0,0,.82)_100%)] px-[10px]">
        <CommentatorNames
          avatarTone="dark"
          avatarUrls={footerAvatarUrls}
          compact
          item={item}
          activeCommentatorId={activeCommentatorId}
          names={footerNames}
          onSelectCommentator={onSelect}
          textClassName="text-[14px]"
        />
        <span className="ml-2 flex shrink-0 items-center gap-[4px] border-l border-[#f68c1f]/30 pl-[14px] text-[14px] font-semibold">
          <span aria-hidden>🔥</span>
          <span>{formatViewerCount(item.channel.viewerCount)}</span>
        </span>
      </div>
    </article>
  );
}

function SportsLiveCard({
  activeCommentatorId,
  isActive,
  item,
  onSelect,
}: {
  activeCommentatorId?: string;
  isActive?: boolean;
  item: PanelLiveItem;
  onSelect: (item: PanelLiveItem) => void;
}) {
  const { match } = item;
  const footerNames = getLiveFooterNames(item);
  const footerAvatarUrls = getLiveFooterAvatarUrls(item);
  const categoryName =
    match.tournament ||
    match.categoryNames?.[0] ||
    match.categoryName ||
    "Thể thao";
  const tournamentLogoUrl = getAssetImageUrl(match.tournamentLogoUrl);
  const categoryIconSrc =
    match.categoryKind === "esports"
      ? esportsIconSrc
      : tournamentLogoUrl || footballIconSrc;
  const cardBackgroundSrc =
    match.categoryKind === "esports"
      ? "/assets/bg_esport_card.jpg"
      : "/assets/bg-sports.jpg";

  return (
    <article
      role="button"
      tabIndex={0}
      className={`relative justify-between flex cursor-pointer flex-col overflow-hidden rounded-[5px] border bg-black text-white shadow-[0_2px_0_rgba(0,0,0,.65)] ${
        isActive ? "border-white opacity-60" : "border-[#ff8c13]"
      }`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.5), rgba(0,0,0,.5)), url('${cardBackgroundSrc}')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
      onClick={() => onSelect(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item);
        }
      }}
    >
      <div className="relative z-20 flex h-5 shrink-0 items-center justify-between overflow-hidden pr-[10px]">
        <div className="flex h-5 max-w-[70%] items-center gap-[5px] rounded-br-[10px] bg-[#f68c1f] px-[5px] text-[10px] font-medium">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
            <Image
              src={categoryIconSrc}
              alt=""
              width={15}
              height={15}
              aria-hidden
              className="h-[14.6px] w-[14.6px] object-contain"
            />
          </span>
          <span className="truncate">{categoryName}</span>
        </div>
        <ChannelStatusBadge status={item.channel.status} inline />
      </div>
      <div className="relative z-10 grid h-[118px] shrink-0 grid-cols-[minmax(0,1fr)_minmax(64px,.9fr)_minmax(0,1fr)] items-center justify-between overflow-hidden px-[5px] min-[1920px]:grid-cols-[80px_110px_80px] min-[1920px]:px-[10px]">
        <SportsTeam
          name={match.homeTeamName}
          imageUrl={match.homeTeamImageUrl}
        />
        <div className="flex h-[74px] min-w-0 flex-col items-center justify-center overflow-visible px-[3px] text-center min-[1920px]:h-[100px] min-[1920px]:w-[110px] min-[1920px]:px-0">
          <div className="flex h-[18px] w-full items-center justify-center text-[18px] font-semibold uppercase leading-none text-white min-[1920px]:h-[23px] min-[1920px]:w-[110px] min-[1920px]:text-[24px]">
            {formatMatchTime(match.startTime)}
          </div>
          <div className="mt-[5px] flex h-[15px] max-w-full items-center justify-center whitespace-nowrap rounded-[3px] bg-[linear-gradient(180deg,#fd8901_0%,#ffa54e_100%)] px-[4px] text-[8px] font-medium uppercase leading-none text-white min-[1920px]:mt-[7px] min-[1920px]:h-5 min-[1920px]:min-w-[104px] min-[1920px]:px-[8px] min-[1920px]:text-[13px]">
            {formatMatchDate(match.startTime)}
          </div>
        </div>
        <SportsTeam
          name={match.awayTeamName}
          imageUrl={match.awayTeamImageUrl}
        />
      </div>
      <div className="relative z-20 flex h-9 shrink-0 items-center overflow-hidden border-t border-[#f68c1f] bg-[linear-gradient(0deg,rgba(0,0,0,.8)_13%,rgba(36,36,36,.8)_45%,rgba(0,0,0,0)_100%)] px-[10px] text-[12px] leading-none">
        <div className="flex w-full items-center justify-between">
          <CommentatorNames
            avatarUrls={footerAvatarUrls}
            activeCommentatorId={activeCommentatorId}
            item={item}
            names={footerNames}
            onSelectCommentator={onSelect}
          />
          <span className="ml-2 flex shrink-0 items-center gap-[4px] text-[12px] font-normal">
            <span aria-hidden>🔥</span>
            <span>{formatViewerCount(item.channel.viewerCount)}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

function SportsTeam({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const logoUrl = getAssetImageUrl(imageUrl);

  return (
    <div className="flex h-[64px] min-w-0 flex-col items-center justify-center gap-[3px] overflow-visible py-[3px] min-[1920px]:h-[100px] min-[1920px]:w-20 min-[1920px]:gap-[5px] min-[1920px]:py-[10px]">
      <div className="relative flex h-[40px] w-[40px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ffac80] bg-white p-[3px] min-[1920px]:h-[50px] min-[1920px]:w-[50px] min-[1920px]:p-[10px]">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={40}
            height={40}
            className="h-[32px] w-[32px] object-contain min-[1920px]:h-[40px] min-[1920px]:w-[40px]"
          />
        ) : (
          <span className="text-[10px] font-black text-[#1f4d8f] min-[1920px]:text-[14px]">
            {getInitials(name)}
          </span>
        )}
      </div>
      <div className="w-full max-w-[56px] truncate text-center text-[10px] font-medium leading-[12px] text-white min-[1920px]:max-w-[70px] min-[1920px]:text-[14px] min-[1920px]:leading-[17px]">
        {name}
      </div>
    </div>
  );
}

function CommentatorNames({
  avatarTone = "light",
  avatarUrls,
  activeCommentatorId,
  compact = false,
  item,
  names,
  onSelectCommentator,
  textClassName,
}: {
  activeCommentatorId?: string;
  avatarTone?: "dark" | "light";
  avatarUrls?: string[];
  compact?: boolean;
  item?: PanelLiveItem;
  names: string[];
  onSelectCommentator?: (item: PanelLiveItem) => void;
  textClassName?: string;
}) {
  const canOpenByCommentator = (item?.channel.lives?.length || 0) > 1;

  return (
    <span className="flex min-w-0 items-center gap-[7px] overflow-hidden">
      {names.map((name, index) => {
        const avatarUrl = getAssetImageUrl(avatarUrls?.[index]);
        const selectedLive = item?.channel.lives?.[index];
        const canSelectCommentator = canOpenByCommentator && selectedLive;
        const isActiveCommentator =
          Boolean(activeCommentatorId) &&
          selectedLive?.commentatorId === activeCommentatorId;

        return (
        <span
          key={`${name}-${index}`}
          className={`flex min-w-0 shrink items-center gap-[5px] ${
            canSelectCommentator ? "cursor-pointer" : ""
          }`}
          role={canSelectCommentator ? "button" : undefined}
          tabIndex={canSelectCommentator ? 0 : undefined}
          onClick={(event) => {
            if (!item || !selectedLive) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            onSelectCommentator?.(buildPanelItemForLive(item, selectedLive));
          }}
          onKeyDown={(event) => {
            if (
              !item ||
              !selectedLive ||
              (event.key !== "Enter" && event.key !== " ")
            ) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            onSelectCommentator?.(buildPanelItemForLive(item, selectedLive));
          }}
        >
          <span
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#f68c1f] font-bold ${
              isActiveCommentator
                ? "bg-[#f68c1f] text-white ring-2 ring-white"
                : avatarTone === "dark"
                ? "bg-[#1f2937] text-white"
                : "bg-white text-[#1f2937]"
            } ${compact ? "h-5 w-5 text-[7px]" : "h-6 w-6 text-[9px]"}`}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={compact ? 20 : 24}
                height={compact ? 20 : 24}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(name)
            )}
          </span>
          <span
            className={`truncate font-medium capitalize ${
              isActiveCommentator ? "text-[#ffb35c]" : ""
            } ${textClassName || ""}`}
          >
            {name}
          </span>
        </span>
        );
      })}
    </span>
  );
}

function buildPanelItemForLive(
  item: PanelLiveItem,
  live: PanelLiveItem["channel"]["live"],
): PanelLiveItem {
  return {
    ...item,
    channel: {
      ...item.channel,
      live,
    },
    videoUrl: live.videoUrl || null,
    authorizedPlaybackUrl: live.authorizedPlaybackUrl || live.videoUrl || null,
    token: live.token || item.token,
    expiresAt: live.expiresAt || item.expiresAt,
  };
}

function getLiveFooterAvatarUrls(item: PanelLiveItem) {
  const avatarUrls = item.channel.commentatorAvatarUrls
    ?.map((url) => url.trim())
    .filter(Boolean);

  if (avatarUrls?.length) {
    return avatarUrls;
  }

  const liveAvatarUrl = item.channel.live.commentatorAvatarUrl?.trim();

  return liveAvatarUrl ? [liveAvatarUrl] : undefined;
}

function ChannelStatusBadge({
  inline = false,
  status,
}: {
  inline?: boolean;
  status?: PanelLiveItem["channel"]["status"];
}) {
  const { backgroundColor, label } = getChannelStatusBadgeConfig(status);
  const isLive = status === "live";

  return (
    <div
      className={`flex items-center justify-center gap-[2px] px-[3px] text-center font-black uppercase leading-none text-[#f2f2f2] ${
        isLive
          ? "h-[12px] w-[30px] rounded-[3px] text-[6px]"
          : "h-[14px] w-[64px] rounded-[2px] text-[6px]"
      } ${inline ? "" : "absolute right-[10px] top-1 z-20"}`}
      style={{ backgroundColor }}
    >
      {isLive ? (
        <span className="h-[3px] w-[3px] rounded-full bg-white" />
      ) : null}
      {label}
    </div>
  );
}

