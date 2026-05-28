"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { HomeLiveVideoItem } from "@/models/match";
import {
  buildLiveDetailHref,
  buildLiveDetailSlug,
  formatMatchDate,
  formatMatchTime,
  formatViewerCount,
  getChannelStatusBadgeConfig,
  getHomeCardHeight,
  getInitials,
  getLiveFooterNames,
  isEsportsMatch,
} from "@/helpers/string";
import { getAssetImageUrl } from "@/services/homeAssets";
import type { CardItem } from "../homeData";
import type { CardSize, CategoryFeature } from ".";

const panelIconBasePath = "/assets/icon_video_pannel";
const cardIcons = {
  football: `${panelIconBasePath}/Frame-1.svg`,
  esports: `${panelIconBasePath}/Vector-2.svg`,
  casino: `${panelIconBasePath}/Frame.svg`,
  idol: `${panelIconBasePath}/Frame-2.svg`,
};
const CATEGORY_CARD_BACKGROUND_SRC = "/assets/bg-sports.jpg";
const ESPORT_CARD_BACKGROUND_SRC = "/assets/bg_esport_card.jpg";

function FireIcon({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/assets/ic_fire.svg"
      alt=""
      width={compact ? 12 : 14}
      height={compact ? 12 : 14}
      className={compact ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"}
      aria-hidden
    />
  );
}

export function GenericChannelLiveCard({
  item,
  size,
}: {
  item: HomeLiveVideoItem;
  size: CardSize;
}) {
  const live = item.channel.live;
  const match = item.match;

  return (
    <article
      className={`relative cursor-pointer overflow-hidden rounded-[5px] border border-[#f68c1f] bg-[#050505] shadow-[0_2px_0_rgba(0,0,0,.65)] ${getHomeCardHeight(
        size,
      )}`}
    >
      <div className="absolute left-0 top-0 z-10 flex h-5 max-w-[70%] items-center gap-[5px] rounded-br-[10px] bg-[#f68c1f] px-[5px] text-[10px] font-medium">
        <span className="truncate">
          {match.tournament || match.categoryName || "Live"}
        </span>
      </div>
      <ChannelStatusBadge status={item.channel.status} />
      <div className="flex h-full flex-col justify-center px-[14px] pb-10 pt-8 text-white">
        <div className="text-[13px] font-bold text-[#ff8c13]">
          {live.liveName}
        </div>
        <h3 className="mt-2 line-clamp-2 text-[18px] font-black leading-[22px]">
          {match.title || `${match.homeTeamName} vs ${match.awayTeamName}`}
        </h3>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-[13px] font-semibold">
          <span className="truncate">{match.homeTeamName}</span>
          <span className="rounded bg-[#242424] px-2 py-1 text-[#ff8c13]">
            {match.score || "0-0"}
          </span>
          <span className="truncate">{match.awayTeamName}</span>
        </div>
      </div>
      <CardFooter
        item={item}
        commentatorAvatarUrls={getLiveFooterAvatarUrls(item)}
        commentatorNames={getLiveFooterNames(item)}
        viewerCount={item.channel.viewerCount}
      />
    </article>
  );
}

export function LiveCardLink({
  children,
  item,
}: {
  children: ReactNode;
  item: HomeLiveVideoItem;
}) {
  return (
    <Link
      className="block min-w-0 text-inherit no-underline"
      href={`/live/${buildLiveDetailSlug(item)}`}
    >
      {children}
    </Link>
  );
}

function CategoryIconBadge({ iconSrc }: { iconSrc: string }) {
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

export function VisualChannelLiveCard({
  item,
  size,
  variant,
}: {
  item: HomeLiveVideoItem;
  size: CardSize;
  variant: "casino" | "idol";
}) {
  const live = item.channel.live;
  const match = item.match;
  const fallbackImage =
    variant === "idol"
      ? "/assets/img_bg_idol.png"
      : "/assets/img_bg_casino.png";
  const fallbackHost = variant === "idol" ? "Streamer" : "BLV";
  const backgroundImageUrl =
    getAssetImageUrl(
      item.liveBackgroundImageUrl || match.liveBackgroundImageUrl,
    ) || fallbackImage;
  const isBannerCard = size === "carousel";
  const footerNames = getLiveFooterNames(item, fallbackHost);
  const footerAvatarUrls = getLiveFooterAvatarUrls(item);
  const categoryIconSrc = cardIcons[variant];

  return (
    <>
      {size === "hot" ? (
        <article className="relative z-10 flex h-[123px] cursor-pointer flex-col justify-end overflow-hidden rounded-[5px] border border-[#f68c1f] bg-[#050505] text-white shadow-[0_10px_22px_rgba(0,0,0,.65)] sm:hidden">
          <Image
            src={backgroundImageUrl}
            alt=""
            fill
            className="z-0 object-cover"
            sizes="50vw"
            unoptimized={false}
            aria-hidden
          />
          <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,.02)_0%,rgba(0,0,0,.04)_55%,rgba(0,0,0,.65)_100%)]" />
          <CategoryIconBadge iconSrc={categoryIconSrc} />
          <ChannelStatusBadge status={item.channel.status} />
          <div className="relative z-10 flex h-[30px] items-center justify-between border-t border-[#f68c1f] bg-[linear-gradient(0deg,rgba(0,0,0,.8)_13%,rgba(36,36,36,.8)_45%,rgba(0,0,0,0)_100%)] px-[10px] text-[10px] font-medium text-white">
            <CommentatorNames
              avatarTone="dark"
              avatarUrls={footerAvatarUrls}
              compact
              item={item}
              names={[footerNames[0] || fallbackHost]}
              textClassName="text-[10px]"
            />
            <span className="ml-2 flex shrink-0 items-center gap-[4px]">
              <FireIcon compact />
              <span>{formatViewerCount(item.channel.viewerCount)}</span>
            </span>
          </div>
        </article>
      ) : null}
      <article
        className={`relative z-10 cursor-pointer flex-col justify-end overflow-hidden rounded-[5px] border border-[#f68c1f] bg-[#050505] bg-cover bg-center text-white shadow-[0_10px_22px_rgba(0,0,0,.65)] ${
          size === "hot" ? "hidden sm:flex" : "flex"
        } ${
          isBannerCard ? "h-[204px] w-full min-w-0" : getHomeCardHeight(size)
        }`}
      >
        <Image
          src={backgroundImageUrl}
          alt=""
          fill
          className="z-0 object-cover"
          sizes={
            isBannerCard
              ? "(min-width: 1536px) 340px, 100vw"
              : "(min-width: 1536px) 340px, 100vw"
          }
          unoptimized={false}
          aria-hidden
        />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,.05)_0%,rgba(0,0,0,.08)_55%,rgba(0,0,0,.72)_100%)]" />
        <CategoryIconBadge iconSrc={categoryIconSrc} />
        <ChannelStatusBadge status={item.channel.status} />
        <div
          className={`relative z-10 flex items-center justify-between border-t border-[#f68c1f] bg-[linear-gradient(90deg,rgba(0,0,0,.76)_0%,rgba(32,32,32,.7)_65%,rgba(0,0,0,.82)_100%)] ${
            isBannerCard ? "h-[46px] px-[10px]" : "h-10 px-[12px]"
          }`}
        >
          <CommentatorNames
            avatarTone="dark"
            avatarUrls={footerAvatarUrls}
            compact={isBannerCard}
            item={item}
            names={footerNames}
            textClassName={
              isBannerCard
                ? "text-[11px] min-[1920px]:text-[14px]"
                : "text-[16px]"
            }
          />
          <span
            className={`ml-2 flex shrink-0 items-center gap-[4px] border-l border-[#f68c1f]/30 pl-[14px] font-semibold ${
              isBannerCard
                ? "text-[11px] min-[1920px]:text-[14px]"
                : "text-[16px]"
            }`}
          >
            <FireIcon compact={isBannerCard} />
            <span>{formatViewerCount(item.channel.viewerCount)}</span>
          </span>
        </div>
      </article>
    </>
  );
}

export function SportsChannelLiveCard({
  feature,
  item,
  size,
}: {
  feature?: CategoryFeature;
  item: HomeLiveVideoItem;
  size: CardSize;
}) {
  const live = item.channel.live;
  const match = item.match;
  const categoryName =
    match.tournament ||
    match.categoryNames?.[0] ||
    match.categoryName ||
    "Thể thao";
  const tournamentLogoUrl = getAssetImageUrl(match.tournamentLogoUrl);
  const isEsportsCard = feature === "esports" || isEsportsMatch(match);
  const categoryIconSrc = isEsportsCard
    ? cardIcons.esports
    : tournamentLogoUrl || cardIcons.football;
  const isBannerCard = size === "carousel" && Boolean(feature);
  const footerNames = getLiveFooterNames(item);
  const cardBackgroundStyle = {
    backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.42),rgba(0,0,0,.42)),url('${
      isEsportsCard ? ESPORT_CARD_BACKGROUND_SRC : CATEGORY_CARD_BACKGROUND_SRC
    }')`,
  };

  return (
    <>
      {size === "hot" ? (
        <article
          className="relative z-10 flex h-[123px] cursor-pointer flex-col justify-between overflow-hidden rounded-[10px] border border-[#f68c1f] bg-black bg-cover bg-center text-white shadow-[0_10px_22px_rgba(0,0,0,.65)] sm:hidden"
          style={cardBackgroundStyle}
        >
          <div className="relative z-20 flex h-5 shrink-0 items-center justify-between overflow-hidden sm:pr-[10px] pr-1.25">
            <div className="flex h-5 max-w-[78%] items-center gap-[5px] rounded-br-[10px] bg-[#f68c1f] px-[5px] text-[8px] sm:text-[10px] font-medium leading-none">
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
          <div className="relative z-10 flex h-[72px] items-center justify-between overflow-hidden sm:px-[10px] px-1.25">
            <MobileSportsTeamBadge
              imageUrl={match.homeTeamImageUrl}
              name={match.homeTeamName}
            />
            <div className="flex h-[72px] max-w-1/3 shrink-0 items-center justify-center overflow-hidden">
              <div className="flex h-[100px] w-full flex-col items-center justify-center gap-[5px] rounded-[5px] px-[10px] py-[15px]">
                <div className="flex h-[15px] w-[70px] items-center justify-center text-center text-[16px] font-semibold uppercase leading-none text-white">
                  {formatMatchTime(match.startTime)}
                </div>
                <div className="flex h-4 w-[68px] items-center justify-center rounded-[3px] bg-[linear-gradient(180deg,#fd8901_0%,#ffa54e_100%)] px-[5px] text-[10px] font-medium uppercase leading-none text-white">
                  {formatMatchDate(match.startTime)}
                </div>
              </div>
            </div>
            <MobileSportsTeamBadge
              imageUrl={match.awayTeamImageUrl}
              name={match.awayTeamName}
            />
          </div>
          <div className="relative z-10 flex h-[30px] items-center justify-between border-t border-[#f68c1f] bg-[linear-gradient(0deg,rgba(0,0,0,.8)_13%,rgba(36,36,36,.8)_45%,rgba(0,0,0,0)_100%)] px-[10px] text-[10px] font-medium text-white">
            <CommentatorNames
              avatarUrls={getLiveFooterAvatarUrls(item)}
              compact
              item={item}
              names={[footerNames[0] || "Live"]}
              textClassName="text-[10px]"
            />
            <span className="ml-2 flex shrink-0 items-center gap-[4px]">
              <FireIcon compact />
              <span>{formatViewerCount(item.channel.viewerCount)}</span>
            </span>
          </div>
        </article>
      ) : null}
      <article
        className={`relative z-10 cursor-pointer flex-col justify-between overflow-hidden rounded-[5px] border border-[#f68c1f] text-white shadow-[0_10px_22px_rgba(0,0,0,.65)] ${
          size === "hot" ? "hidden sm:flex" : "flex"
        } ${
          isBannerCard
            ? "h-[204px] w-full min-w-0 bg-[#050505] bg-cover bg-center"
            : `${getHomeCardHeight(size)} bg-[#050505] bg-cover bg-center`
        }`}
        style={cardBackgroundStyle}
      >
        <div className="relative z-20 flex h-[25px] shrink-0 items-center justify-between overflow-hidden pr-[6px]">
          <div className="flex h-[25px] max-w-[72%] items-center rounded-br-[10px] bg-[#f68c1f] px-[5px] text-[8px] font-medium leading-none">
            <span className="flex mr-1.25 h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
              <Image
                src={categoryIconSrc}
                alt=""
                width={15}
                height={15}
                aria-hidden
                className="h-[14.6px] w-[14.6px] object-contain"
              />
            </span>
            <span className="truncate text-[10px]">{categoryName}</span>
          </div>
          <ChannelStatusBadge status={item.channel.status} inline />
        </div>
        <div
          className={`flex flex-row justify-center ${
            isBannerCard ? "h-[118px] items-center gap-[4px] px-[10px]" : ""
          }`}
        >
          <SportsTeamBadge
            name={match.homeTeamName}
            imageUrl={match.homeTeamImageUrl}
          />
          <div
            className={`flex min-w-0 flex-col items-center justify-center overflow-visible text-center ${
              isBannerCard
                ? "h-[70px] w-[72px] shrink-0 px-0 min-[1920px]:h-[100px] min-[1920px]:w-auto min-[1920px]:flex-1 min-[1920px]:px-[8px]"
                : "h-[100px] w-[160px]"
            }`}
          >
            <div
              className={`flex items-center justify-center font-semibold uppercase leading-none text-white ${
                isBannerCard
                  ? "h-[17px] w-full text-[18px] min-[1920px]:h-[23px] min-[1920px]:text-[36px]"
                  : "h-[23px] w-[110px] text-[36px]"
              }`}
            >
              {formatMatchTime(match.startTime)}
            </div>
            <div
              className={`mt-[5px] flex items-center justify-center whitespace-nowrap rounded-[3px] bg-[linear-gradient(180deg,#fd8901_0%,#ffa54e_100%)] font-medium uppercase leading-none text-white ${
                isBannerCard
                  ? "h-[15px] min-w-0 max-w-full px-[4px] text-[8px] min-[1920px]:h-5 min-[1920px]:min-w-[104px] min-[1920px]:px-[8px] min-[1920px]:text-[14px]"
                  : "h-5 min-w-[104px] px-[8px] text-[14px]"
              }`}
            >
              {formatMatchDate(match.startTime)}
            </div>
          </div>
          <SportsTeamBadge
            name={match.awayTeamName}
            imageUrl={match.awayTeamImageUrl}
          />
        </div>
        <CardFooter
          compact={isBannerCard}
          item={item}
          commentatorAvatarUrls={getLiveFooterAvatarUrls(item)}
          commentatorNames={footerNames}
          viewerCount={item.channel.viewerCount}
        />
      </article>
    </>
  );
}

export function MatchCard({
  feature,
  item,
  size,
}: {
  feature?: CategoryFeature;
  item: CardItem;
  size: CardSize;
}) {
  const isCompact = size === "compact";
  const isBannerCard = size === "carousel" && Boolean(feature);
  const cardBackgroundStyle = isBannerCard
    ? {
        backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.42),rgba(0,0,0,.42)),url('${CATEGORY_CARD_BACKGROUND_SRC}')`,
      }
    : undefined;

  return (
    <article
      className={`relative z-10 cursor-pointer overflow-hidden rounded-[5px] border border-[#f68c1f] shadow-[0_10px_22px_rgba(0,0,0,.65)] ${
        isBannerCard
          ? "h-[204px] w-full min-w-0 bg-[#050505] bg-cover bg-center"
          : `${getHomeCardHeight(size)} bg-[#050505]`
      }`}
      style={cardBackgroundStyle}
    >
      <div className="absolute left-0 top-0 z-10 flex h-5 items-center gap-[5px] rounded-br-[10px] bg-[#f68c1f] px-[5px] text-[10px] font-medium">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
          <Image
            src={cardIcons.football}
            alt=""
            width={13}
            height={13}
            aria-hidden
          />
        </span>
        {item.title}
      </div>
      {item.live ? <ChannelStatusBadge status="live" /> : null}
      <div
        className={`grid items-center justify-center overflow-hidden ${
          isBannerCard
            ? "h-[118px] grid-cols-[minmax(0,1fr)_minmax(62px,.86fr)_minmax(0,1fr)] gap-[3px] px-[5px] min-[1920px]:grid-cols-[80px_110px_80px] min-[1920px]:gap-[10px] min-[1920px]:px-[10px]"
            : "h-[calc(100%-36px)] grid-cols-[80px_110px_80px] gap-[10px] px-[10px] pt-5"
        }`}
      >
        <TeamBadge name={item.home || "AL"} tone="blue" />
        <div
          className={`flex min-w-0 flex-col items-center justify-center rounded-[5px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(0,0,0,.2)_100%),linear-gradient(180deg,#484848_0%,#000_100%)] text-center ${
            isBannerCard
              ? "h-[74px] w-full px-[3px] min-[1920px]:h-[100px] min-[1920px]:w-[110px] min-[1920px]:px-0"
              : isCompact
                ? "h-[100px] w-[110px]"
                : "px-4 py-5"
          }`}
        >
          <div
            className={`${
              isBannerCard
                ? "text-[18px] min-[1920px]:text-[24px]"
                : isCompact
                  ? "text-[24px]"
                  : "text-[36px]"
            } font-semibold leading-none`}
          >
            22:30
          </div>
          <div
            className={`mt-[5px] flex items-center justify-center rounded-[3px] bg-[linear-gradient(180deg,#fd8901_0%,#ffa54e_100%)] font-medium ${
              isBannerCard
                ? "h-[15px] max-w-full px-[5px] text-[8px] min-[1920px]:h-4 min-[1920px]:px-[10px] min-[1920px]:text-[10px]"
                : "h-4 px-[10px] text-[10px]"
            }`}
          >
            15-11-2025
          </div>
        </div>
        <TeamBadge name={item.away || "T1"} tone="red" />
      </div>
      <CardFooter compact={isBannerCard} title="Ero Tèo" />
    </article>
  );
}

function TeamBadge({ name, tone }: { name: string; tone: "blue" | "red" }) {
  return (
    <div className="flex w-[80px] flex-col items-center text-center">
      <div
        className={`flex cursor-pointer items-center justify-center rounded-full bg-[#d9d9d9] font-black ${"mb-[5px] h-[50px] w-[50px] border-[3px] text-[18px]"} ${
          tone === "blue"
            ? "border-[#48a8dc] text-[#2484b7]"
            : "border-[#e24536] text-[#c9352a]"
        }`}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="w-[72px] truncate text-center text-[13px] font-medium text-white">
        {name}
      </div>
    </div>
  );
}

export function MediaCard({ item, size }: { item: CardItem; size: CardSize }) {
  const palette =
    item.kind === "idol"
      ? "from-[#58d5ff] via-[#092c57] to-[#0c0f18]"
      : item.kind === "promo"
        ? "from-[#fff2a4] via-[#ff8c13] to-[#9b240d]"
        : "from-[#ffd167] via-[#b56818] to-[#23150a]";

  return (
    <article
      className={`relative cursor-pointer overflow-hidden rounded-[5px] border border-[#f68c1f] bg-gradient-to-br ${palette} ${getHomeCardHeight(
        size,
      )}`}
    >
      <ChannelStatusBadge status="live" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(255,255,255,.8),transparent_22%)]" />
      <div className="absolute left-5 top-6 max-w-[210px] text-[30px] font-black leading-none text-white drop-shadow">
        {item.kind === "idol"
          ? "Girl"
          : item.kind === "promo"
            ? "Open"
            : "Center"}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/55 px-3 py-2">
        <p className="truncate text-[12px] font-bold">{item.title}</p>
      </div>
    </article>
  );
}

function CardFooter({
  compact = false,
  commentatorAvatarUrls,
  commentatorNames,
  item,
  title,
  viewerCount,
}: {
  compact?: boolean;
  commentatorAvatarUrls?: string[];
  commentatorNames?: string[];
  item?: HomeLiveVideoItem;
  title?: string;
  viewerCount?: number;
}) {
  const names = commentatorNames?.length ? commentatorNames : [title || "Live"];

  return (
    <div
      className={`flex items-center justify-between border-t border-[#f68c1f] bg-[linear-gradient(0deg,rgba(0,0,0,.8)_13%,rgba(36,36,36,.8)_45%,rgba(0,0,0,0)_100%)] text-white ${
        compact
          ? "h-[40px] px-[6px] text-[7px] min-[1920px]:h-[40px] min-[1920px]:px-[7px] min-[1920px]:text-[8px]"
          : "h-10 px-[10px] text-[12px]"
      }`}
    >
      <CommentatorNames
        avatarUrls={commentatorAvatarUrls}
        compact={compact}
        item={item}
        names={names}
      />
      <span className="ml-2 flex shrink-0 items-center gap-[4px] text-white">
        <FireIcon compact={compact} />
        <span className="text-[12px]">{formatViewerCount(viewerCount)}</span>
      </span>
    </div>
  );
}

function getLiveFooterAvatarUrls(item: HomeLiveVideoItem) {
  const avatarUrls = item.channel.commentatorAvatarUrls
    ?.map((url) => url.trim())
    .filter(Boolean);

  if (avatarUrls?.length) {
    return avatarUrls;
  }

  const liveAvatarUrl = item.channel.live.commentatorAvatarUrl?.trim();

  return liveAvatarUrl ? [liveAvatarUrl] : undefined;
}

function CommentatorNames({
  avatarTone = "light",
  avatarUrls,
  compact = false,
  item,
  names,
  textClassName,
}: {
  avatarTone?: "dark" | "light";
  avatarUrls?: string[];
  compact?: boolean;
  item?: HomeLiveVideoItem;
  names: string[];
  textClassName?: string;
}) {
  const router = useRouter();
  const canOpenByCommentator = (item?.channel.lives?.length || 0) > 1;

  return (
    <span className="flex min-w-0 items-center gap-[7px] overflow-hidden">
      {names.map((name, index) => {
        const avatarUrl = getAssetImageUrl(avatarUrls?.[index]);
        const commentatorId = item?.channel.lives?.[index]?.commentatorId;
        const commentatorHref =
          canOpenByCommentator && commentatorId
            ? buildLiveDetailHref(item, commentatorId)
            : undefined;

        return (
          <span
            key={`${name}-${index}`}
            className={`flex min-w-0 shrink items-center gap-[5px] ${
              commentatorHref ? "cursor-pointer" : ""
            }`}
            role={commentatorHref ? "button" : undefined}
            tabIndex={commentatorHref ? 0 : undefined}
            onClick={(event) => {
              if (!commentatorHref) {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              router.push(commentatorHref);
            }}
            onKeyDown={(event) => {
              if (
                !commentatorHref ||
                (event.key !== "Enter" && event.key !== " ")
              ) {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              router.push(commentatorHref);
            }}
          >
            <span
              className={`flex shrink-0 items-center pt-0.5 justify-center overflow-hidden rounded-full border border-[#f68c1f] font-bold ${
                avatarTone === "dark"
                  ? "bg-[#1f2937] text-white"
                  : "bg-white text-[#1f2937]"
              } ${
                compact
                  ? "h-[20px] w-[20px] sm:h-[30px] sm:w-[30px] text-[9px] min-[1920px]:h-5 min-[1920px]:w-5 min-[1920px]:text-[10px]"
                  : "w-7.5 h-7.5 text-[12px]"
              }`}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={compact ? 30 : 24}
                  height={compact ? 30 : 24}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(name)
              )}
            </span>
            <span
              className={`truncate font-medium sm:text-[12px] text-[10px] capitalize ${
                textClassName || ""
              }`}
            >
              {name}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function SportsTeamBadge({
  imageUrl,
  name,
}: {
  imageUrl?: string;
  name: string;
}) {
  const logoUrl = getAssetImageUrl(imageUrl);

  return (
    <div className="flex h-[110px] w-[85px] flex-col items-center justify-center gap-[5px] overflow-visible py-[10px]">
      <div className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ffac80] bg-white p-[10px]">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={40}
            height={40}
            className="h-[40px] w-[40px] object-contain"
          />
        ) : (
          <span className="text-[14px] font-black text-[#1f4d8f]">
            {getInitials(name)}
          </span>
        )}
      </div>
      <div className="w-[70px] truncate text-center text-[14px] font-medium leading-[17px] text-white">
        {name}
      </div>
    </div>
  );
}

function MobileSportsTeamBadge({
  imageUrl,
  name,
}: {
  imageUrl?: string;
  name: string;
}) {
  const logoUrl = getAssetImageUrl(imageUrl);

  return (
    <div className="flex sm:max-w-1/3 shrink-0 flex-col items-center justify-center gap-[5px] overflow-hidden py-[10px]">
      <div className="relative flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ffac80] bg-white p-[2px]">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={30}
            height={30}
            className="h-[30px] w-[30px] object-contain"
          />
        ) : (
          <span className="text-[10px] font-black text-[#1f4d8f]">
            {getInitials(name)}
          </span>
        )}
      </div>
      <div className="truncate max-w-[60px] text-center sm:text-[10px] text-[8px] font-medium leading-[12px] text-white">
        {name}
      </div>
    </div>
  );
}

function ChannelStatusBadge({
  inline = false,
  status,
}: {
  inline?: boolean;
  status?: HomeLiveVideoItem["channel"]["status"];
}) {
  const { backgroundColor, label } = getChannelStatusBadgeConfig(status);
  const isLive = status === "live";

  return (
    <div
      className={`flex items-center justify-center gap-[2px] px-[3px] text-center font-black uppercase leading-none text-[#f2f2f2] ${
        isLive
          ? "h-[12px] w-[30px] rounded-[3px] text-[6px]"
          : "h-[14px] sm:w-[64px]  w-auto rounded-[2px] sm:text-[6px] text-[4px]"
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
