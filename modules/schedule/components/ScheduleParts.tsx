import { useRef, type ReactNode } from "react";
import Link from "next/link";
import type { HomeLiveVideoItem, HomeLiveChannelItem } from "@/models/match";
import {
  buildLiveDetailHref,
  formatMatchDate,
  formatMatchTime,
  getChannelStatusBadgeConfig,
} from "@/helpers/string";
import { getAssetImageUrl } from "@/services/homeAssets";
import type {
  ScheduleCategory,
  ScheduleDay,
} from "../hooks/useScheduleMatches";

type ScheduleCommentator = {
  avatarUrl?: string;
  id?: string;
  isLive: boolean;
  name: string;
};

const categories: Array<{
  iconSrc: string;
  key: ScheduleCategory;
  label: string;
}> = [
  {
    iconSrc: "/assets/bongda.svg",
    key: "Bóng đá",
    label: "Bóng đá",
  },
  {
    iconSrc: "/assets/bongro.svg",
    key: "Bóng rổ",
    label: "Bóng rổ",
  },
  {
    iconSrc: "/assets/tenis.svg",
    key: "Tennis",
    label: "Tennis",
  },
  {
    iconSrc: "/assets/bongchuyen.svg",
    key: "Bóng chuyền",
    label: "Bóng chuyền",
  },
  {
    iconSrc: "/assets/bongban.svg",
    key: "Bóng bàn",
    label: "Bóng bàn",
  },
  {
    iconSrc: "/assets/ic_white_esports.svg",
    key: "Esports",
    label: "Esports",
  },
  {
    iconSrc: "/assets/ic_white_idol.svg",
    key: "Idol live",
    label: "Giải trí",
  },
  {
    iconSrc: "/assets/ic_white_casino.svg",
    key: "Casino",
    label: "Casino",
  },
];

export function ScheduleHeader() {
  return (
    <header className="relative flex h-[38px] items-center overflow-hidden bg-black px-0 sm:h-[50px] sm:rounded-t-[10px] sm:bg-[linear-gradient(180deg,#FD8901_0%,#FFA54E_100%)] sm:px-[15px]">
      <span
        className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-[462.02px] max-w-full bg-[url('/assets/lich-phat-song/bg_header.png')] bg-[length:100%_100%] bg-right bg-no-repeat sm:block"
        aria-hidden
      />
      <h1 className="relative z-[1] flex items-center gap-1 text-[16px] font-bold leading-none text-[#FD8901] sm:block sm:text-[25px] sm:text-white">
        <span className="text-[25px] font-normal leading-none sm:hidden">
          ‹
        </span>
        Lịch Phát Sóng
      </h1>
    </header>
  );
}

export function ScheduleDateTabs({
  activeDayIndex,
  days,
  onChange,
}: {
  activeDayIndex: number;
  days: ScheduleDay[];
  onChange: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-[5px] pb-1 sm:flex sm:gap-[15px] sm:overflow-x-auto">
      {days.map((day, index) => {
        const isActive = index === activeDayIndex;
        const visibilityClass = index > 5 ? "hidden sm:flex" : "flex";

        return (
          <button
            key={`${day.label}-${day.dateText}`}
            className={`${visibilityClass} h-[40px] min-w-0 cursor-pointer flex-col items-center justify-center rounded-[5px] border text-center transition sm:h-[50px] sm:w-[100px] sm:shrink-0 ${
              isActive
                ? "border-[#ffad57] bg-[#ff8c13] text-white"
                : "border-[#888] bg-[#515151] text-[#c8c8c8] hover:border-[#ff8c13] hover:text-white"
            }`}
            type="button"
            onClick={() => onChange(index)}
          >
            <span className="max-w-full truncate px-0.5 text-[11px] leading-[14px] min-[390px]:text-[12px] sm:px-1 sm:text-[14px] sm:leading-[18px]">
              {day.label}
            </span>
            <span className="my-[2px] h-px w-full bg-[linear-gradient(90deg,rgba(194,194,194,0)_0%,#c2c2c2_50%,rgba(194,194,194,0)_100%)]" />
            <span className="text-[13px] font-semibold leading-[16px] min-[390px]:text-[14px] sm:text-[17px] sm:leading-[22px]">
              {day.dateText}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ScheduleCategoryFilters({
  activeCategory,
  hotOnly,
  onCategoryChange,
  onHotChange,
}: {
  activeCategory: ScheduleCategory;
  hotOnly: boolean;
  onCategoryChange: (category: ScheduleCategory) => void;
  onHotChange: (enabled: boolean) => void;
}) {
  return (
    <div className="mt-[14px] grid gap-2 overflow-visible pb-1 text-[14px] sm:mt-[19px] sm:flex sm:flex-wrap sm:items-center sm:justify-start sm:gap-3 sm:pb-0 sm:text-[16px]">
      <button
        className={`flex h-[30px] w-fit shrink-0 cursor-pointer items-center gap-[5px] rounded-[5px] border px-[8px] transition ${
          hotOnly
            ? "border-[#ff8c13] bg-[#484848] text-[#ff8c13]"
            : "border-transparent bg-[#4f4f4f] text-[#bdbdbd]"
        }`}
        type="button"
        onClick={() => onHotChange(!hotOnly)}
      >
        <CategoryIcon
          className="h-5 w-[17px]"
          src="/assets/icon_video_pannel/Group.svg"
        />
        <span>Hot</span>
        <span
          className={`relative h-[18px] w-[32px] rounded-full transition ${
            hotOnly
              ? "bg-[linear-gradient(270deg,#FAC17F_0%,#FD8901_100%)]"
              : "bg-[#6a6a6a]"
          }`}
        >
          <span
            className={`absolute top-[2px] h-[14px] w-[14px] rounded-full transition ${
              hotOnly ? "left-[16px] bg-white" : "left-[2px] bg-[#d8d8d8]"
            }`}
          />
        </span>
      </button>

      <div className="grid grid-cols-4 gap-1 sm:flex sm:flex-wrap sm:gap-3">
        {categories.map((category) => {
          const isActive = activeCategory === category.key;

          return (
            <button
              key={category.key}
              className={`flex h-[38px] min-w-0 shrink-0 cursor-pointer items-center justify-center gap-[4px] rounded-[5px] px-[5px] text-[10px] transition sm:h-[30px] sm:gap-[5px] sm:rounded-full sm:px-[12px] sm:text-[16px] ${
                isActive
                  ? "bg-[linear-gradient(135deg,#FD8901_0%,#FFA842_100%)] text-white"
                  : "bg-[#565656] text-[#bebebe] hover:bg-[#666] hover:text-white"
              }`}
              type="button"
              onClick={() => onCategoryChange(category.key)}
            >
              <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-6" src={category.iconSrc} />
              <span className="min-w-0 whitespace-normal break-words text-left leading-[11px] sm:truncate sm:whitespace-nowrap sm:leading-normal">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryIcon({ className, src }: { className: string; src: string }) {
  return (
    <span
      className={`shrink-0 bg-current ${className}`}
      style={{
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
      aria-hidden
    />
  );
}

export function ScheduleGrid({ matches }: { matches: HomeLiveVideoItem[] }) {
  return (
    <div className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {matches.map((item) => (
        <ScheduleMatchCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function ScheduleMatchCard({ item }: { item: HomeLiveVideoItem }) {
  if (isEntertainmentItem(item)) {
    return <EntertainmentScheduleCard item={item} />;
  }

  const match = item.match;
  const statusConfig = getChannelStatusBadgeConfig(item.channel.status);
  const commentators = getCommentators(item);

  return (
    <div className="rounded-[6px] bg-[#282828] p-[6px]">
      <Link
        className="block overflow-hidden rounded-[6px] border border-[#f18a0b] bg-[#151515] text-inherit no-underline shadow-[0_12px_24px_rgba(0,0,0,.5)]"
        href={buildLiveDetailHref(item, commentators[0]?.id)}
      >
        <div className="relative min-h-[110px] px-2 pb-[6px] pt-[40px] min-[390px]:px-[16px]">
          <div className="absolute left-0 top-0 flex h-[22px] max-w-[68%] items-center rounded-br-[6px] bg-[#ff8c13] pr-[9px] text-[13px] text-white">
            <span className="ml-[5px] mr-[4px] flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded-full bg-white text-[#ff8c13]">
              <TournamentIcon match={match} />
            </span>
            <span className="truncate">
              {match.tournament || match.categoryName || "Giải đấu"}
            </span>
          </div>
          <span
            className="absolute right-[8px] top-[7px] rounded-[2px] px-[5px] py-[1px] text-[9px] font-bold leading-none text-white"
            style={{ backgroundColor: statusConfig.backgroundColor }}
          >
            {statusConfig.label.toUpperCase()}
          </span>

          <div className="grid grid-cols-[minmax(68px,1fr)_minmax(82px,auto)_minmax(68px,1fr)] items-center gap-1 min-[390px]:gap-2">
            <TeamLogo
              imageUrl={match.homeTeamImageUrl}
              name={match.homeTeamName}
            />
            <div className="min-w-0 text-center">
              <div className="text-[26px] font-bold leading-[32px] text-white min-[390px]:text-[30px] min-[390px]:leading-[36px]">
                {formatMatchTime(match.startTime)}
              </div>
              <div className="mx-auto mt-[6px] flex h-[20px] max-w-[104px] items-center justify-center rounded-[3px] bg-[#ff981e] px-1 text-[12px] font-medium leading-none text-white min-[390px]:px-2 min-[390px]:text-[14px]">
                {formatMatchDate(match.startTime)}
              </div>
            </div>
            <TeamLogo
              imageUrl={match.awayTeamImageUrl}
              name={match.awayTeamName}
            />
          </div>
        </div>

        <CommentatorCarousel commentators={commentators} />
      </Link>
    </div>
  );
}

function EntertainmentScheduleCard({ item }: { item: HomeLiveVideoItem }) {
  const match = item.match;
  const statusConfig = getChannelStatusBadgeConfig(item.channel.status);
  const commentators = getCommentators(item);
  const primaryStreamer = commentators[0];
  const isLive =
    item.channel.status === "live" ||
    item.channel.live.liveStatus === "live" ||
    commentators.some((commentator) => commentator.isLive);
  const streamerName = getStreamerDisplayName(item, primaryStreamer?.name);

  return (
    <div className="rounded-[6px] bg-[#282828] p-[6px]">
      <Link
        className="block overflow-hidden rounded-[6px] border border-[#f18a0b] bg-[#151515] text-inherit no-underline shadow-[0_12px_24px_rgba(0,0,0,.5)]"
        href={buildLiveDetailHref(item, primaryStreamer?.id)}
      >
        <div className="relative flex min-h-[128px] items-center justify-center px-4 pb-4 pt-[30px]">
          <div className="absolute left-0 top-0 flex h-[24px] items-center rounded-br-[6px] bg-[#ff8c13] pr-[8px] text-[13px] leading-none text-white">
            <CategoryIcon
              className="ml-[5px] mr-[4px] h-[16px] w-[16px]"
              src="/assets/lich-phat-song/ic_giaitri.svg"
            />
            <span>Giải trí</span>
          </div>
          <span
            className="absolute right-[8px] top-[7px] rounded-[2px] px-[5px] py-[1px] text-[9px] font-bold leading-none text-white"
            style={{
              backgroundColor: isLive
                ? "#FF0000"
                : statusConfig.backgroundColor,
            }}
          >
            {isLive ? "LIVE" : statusConfig.label}
          </span>

          <div className="flex w-full max-w-[260px] items-center justify-center gap-[20px]">
            <StreamerAvatar
              avatarUrl={primaryStreamer?.avatarUrl}
              name={streamerName}
            />
            <div className="flex min-w-0 items-center gap-[5px] text-[17px] font-bold leading-none text-[#ff8c13]">
              <span className="truncate">
                {streamerName.toLocaleUpperCase("vi-VN")}
              </span>
              <span className="text-[16px] text-[#37d947]">☘️</span>
            </div>
          </div>
        </div>

        <div className="flex h-[30px] items-center justify-center bg-[linear-gradient(180deg,#FFA54E_0%,#FD8901_100%)] text-[14px] font-medium leading-none text-white">
          {isLive ? (
            <span className="flex items-center gap-[8px]">
              Đến Phòng Live
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="h-[16px] w-[16px] shrink-0"
                src="/assets/lich-phat-song/ic_play.svg"
              />
            </span>
          ) : (
            formatMatchTimeRange(match)
          )}
        </div>
      </Link>
    </div>
  );
}

function StreamerAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl?: string;
  name: string;
}) {
  const normalizedAvatarUrl = getAssetImageUrl(avatarUrl) || avatarUrl;

  return (
    <div className="relative h-[104px] w-[104px] shrink-0">
      <div className="absolute left-1/2 top-1/2 h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#262626]">
        {normalizedAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={name}
            className="h-full w-full object-cover"
            src={normalizedAvatarUrl}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[22px] font-bold text-white">
            {name.charAt(0).toLocaleUpperCase("vi-VN")}
          </span>
        )}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        src="/assets/lich-phat-song/ic_bg_avt.svg"
      />
    </div>
  );
}

function CommentatorCarousel({
  commentators,
}: {
  commentators: ScheduleCommentator[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollCommentators(direction: -1 | 1) {
    scrollRef.current?.scrollBy({
      behavior: "smooth",
      left: direction * 130,
    });
  }

  return (
    <div className="grid h-[51px] grid-cols-[22px_1fr_1fr_22px] items-center border-t border-[#b46a10] bg-[linear-gradient(180deg,#2a2a2a_0%,#111_100%)] px-2">
      <button
        aria-label="Cuộn bình luận viên sang trái"
        className="h-full cursor-pointer text-center text-[24px] leading-none text-[#ff8c13]"
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          scrollCommentators(-1);
        }}
      >
        ‹
      </button>
      <div
        ref={scrollRef}
        className="col-span-2 flex min-w-0 gap-[20px] overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {commentators.map((commentator, index) => (
          <CommentatorPill
            key={`${commentator.name}-${index}`}
            avatarUrl={commentator.avatarUrl}
            isLive={commentator.isLive}
            name={commentator.name}
          />
        ))}
      </div>
      <button
        aria-label="Cuộn bình luận viên sang phải"
        className="h-full cursor-pointer text-center text-[24px] leading-none text-[#ff8c13]"
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          scrollCommentators(1);
        }}
      >
        ›
      </button>
    </div>
  );
}

function TeamLogo({ imageUrl, name }: { imageUrl?: string; name: string }) {
  return (
    <div className="flex justify-center flex-col items-center">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name}
          className="mx-auto h-[44px] w-[44px] rounded-full border-2 border-white bg-white object-contain min-[390px]:h-[50px] min-[390px]:w-[50px]"
          src={imageUrl}
        />
      ) : (
        <div className="mx-auto flex h-[44px] w-[44px] items-center justify-center rounded-full border-2 border-white bg-[#262626] text-[18px] font-bold text-[#ff8c13] min-[390px]:h-[50px] min-[390px]:w-[50px] min-[390px]:text-[20px]">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="mt-[7px] w-[69px] truncate text-[12px] leading-[16px] text-white min-[390px]:text-[14px] min-[390px]:leading-[18px]">
        {name}
      </div>
    </div>
  );
}

function CommentatorPill({
  avatarUrl,
  isLive,
  name,
}: {
  avatarUrl?: string;
  isLive?: boolean;
  name: string;
}) {
  const normalizedAvatarUrl = getAssetImageUrl(avatarUrl) || avatarUrl;

  return (
    <div className="flex min-w-[calc((100%_-_20px)/2)] flex-none items-center justify-center">
      {normalizedAvatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name}
          className="h-[34px] w-[34px] shrink-0 rounded-full border border-[#ff8c13] bg-[#121212] object-cover min-[390px]:h-[40px] min-[390px]:w-[40px]"
          src={normalizedAvatarUrl}
        />
      ) : (
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-[#ff8c13] bg-[radial-gradient(circle_at_50%_20%,#45639d_0%,#1f2a55_52%,#080b16_100%)] text-[12px] font-bold text-white min-[390px]:h-[38px] min-[390px]:w-[38px] min-[390px]:text-[13px]">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="flex flex-col justify-center">
        <span className="ml-[4px] min-w-0 truncate text-[12px] text-white min-[390px]:text-[14px]">
          {name}
        </span>
        {isLive ? (
          <span className="ml-[4px] mt-[1px] flex h-[10px] items-center gap-[2px] text-[7px] font-bold leading-[10px] text-[#ff0000]">
            <CategoryIcon
              className="h-[6px] w-[9px]"
              src="/assets/lich-phat-song/ic_live.svg"
            />
            LIVE
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ScheduleState({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={`mx-auto max-w-[520px] rounded-[6px] border bg-[#171717] px-5 py-10 text-center text-[15px] shadow-[0_0_0_6px_#2a2a2a] ${
        tone === "error"
          ? "border-[#ff4d4f] text-[#ff8c13]"
          : "border-[#f18a0b] text-white/75"
      }`}
    >
      {children}
    </div>
  );
}

function getCommentators(item: HomeLiveVideoItem): ScheduleCommentator[] {
  const lives = item.channel.lives?.length
    ? item.channel.lives
    : [item.channel.live];
  const commentatorCount = Math.max(
    lives.length,
    item.channel.commentatorNames?.length || 0,
    item.channel.commentatorAvatarUrls?.length || 0,
    1
  );
  const byLive = Array.from({ length: commentatorCount }, (_, index) =>
    buildCommentatorFromLive(lives[index], item, index)
  ).filter((commentator) => commentator.name);

  if (byLive.length) {
    return byLive;
  }

  return [{ avatarUrl: undefined, id: undefined, isLive: false, name: "BLV" }];
}

function getStreamerDisplayName(
  item: HomeLiveVideoItem,
  commentatorName?: string
) {
  return (
    commentatorName ||
    item.channel.live.commentatorName ||
    item.channel.live.liveName ||
    item.channel.live.roomName ||
    item.channel.title ||
    "Streamer"
  );
}

function formatMatchTimeRange(match: HomeLiveVideoItem["match"]) {
  const startTime = formatMatchTime(match.startTime);

  if (!match.endTime) {
    return startTime;
  }

  return `${startTime} - ${formatMatchTime(match.endTime)}`;
}

function buildCommentatorFromLive(
  live: HomeLiveChannelItem | undefined,
  item: HomeLiveVideoItem,
  index: number
) {
  const name =
    live?.commentatorName ||
    item.channel.commentatorNames?.[index] ||
    live?.liveName ||
    live?.roomName ||
    "BLV";

  return {
    avatarUrl:
      live?.commentatorAvatarUrl || item.channel.commentatorAvatarUrls?.[index],
    id: live?.commentatorId,
    isLive: live?.liveStatus === "live",
    name,
  };
}

function TournamentIcon({ match }: { match: HomeLiveVideoItem["match"] }) {
  if (isSportsMatch(match) && match.tournamentLogoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className="h-full w-full object-contain"
        src={match.tournamentLogoUrl}
      />
    );
  }

  return (
    <CategoryIcon
      className="h-[13px] w-[13px]"
      src={getCategoryIconSrc(match)}
    />
  );
}

function getCategoryIconSrc(match: HomeLiveVideoItem["match"]) {
  const source = `${match.tournament || ""} ${
    match.categoryName || ""
  }`.toLowerCase();

  if (source.includes("casino")) {
    return "/assets/lich-phat-song/ic_casino.svg";
  }

  if (source.includes("esport")) {
    return "/assets/lich-phat-song/ic_esport.svg";
  }

  if (source.includes("idol")) {
    return "/assets/lich-phat-song/ic_giaitri.svg";
  }

  return "/assets/lich-phat-song/ic_thethao.svg";
}

function isEntertainmentItem(item: HomeLiveVideoItem) {
  const match = item.match;
  const source = normalizeSearchText(
    [
      match.type,
      match.categoryName,
      ...(match.categoryNames || []),
      match.tournament,
      item.channel.title,
      item.channel.live.liveName,
      item.channel.live.roomName,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return (
    source.includes("idol") ||
    source.includes("giai tri") ||
    source.includes("entertainment") ||
    source.includes("streamer")
  );
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function isSportsMatch(match: HomeLiveVideoItem["match"]) {
  const source = `${match.type || ""} ${match.categoryName || ""} ${(
    match.categoryNames || []
  ).join(" ")}`.toLowerCase();

  return (
    source.includes("sport") ||
    source.includes("thể thao") ||
    source.includes("the thao") ||
    source.includes("football") ||
    source.includes("bóng đá") ||
    source.includes("bong da")
  );
}
