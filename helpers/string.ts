import type {
  HomeLiveVideoItem,
  LiveChannelStatus,
  LiveMatch,
  TodayMatch,
} from "@/models/match";

export type CategoryKind = "hot" | "sports" | "esports" | "casino" | "idol";
export type MatchDayKeyLike = "yesterday" | "today" | "tomorrow";
export type HomeCardSizeLike = "compact" | "hot" | "carousel";

export type ChannelStatusBadgeConfig = {
  backgroundColor: string;
  label: string;
};

export type BirthdayParts = {
  day: string;
  month: string;
  year: string;
};

export type BirthdaySource =
  | Partial<{
      birthDay: string;
      birthMonth: string;
      birthYear: string;
      birthday: string;
    }>
  | null;

export const PLATFORM_TIME_ZONE =
  process.env.NEXT_PUBLIC_PLATFORM_TIME_ZONE?.trim() || "Asia/Ho_Chi_Minh";

type ZonedDateParts = {
  day: number;
  hour: number;
  millisecond?: number;
  minute: number;
  month: number;
  second: number;
  year: number;
};

function getZonedDateParts(date = new Date(), timeZone = PLATFORM_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const valueByType = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    day: Number(valueByType.day),
    hour: Number(valueByType.hour),
    minute: Number(valueByType.minute),
    month: Number(valueByType.month),
    second: Number(valueByType.second),
    year: Number(valueByType.year),
  };
}

function partsAsUtcTime(parts: ZonedDateParts) {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond || 0,
  );
}

function zonedTimeToUtc(parts: ZonedDateParts, timeZone = PLATFORM_TIME_ZONE) {
  const desiredUtcTime = partsAsUtcTime(parts);
  let utcTime = desiredUtcTime;

  for (let index = 0; index < 2; index += 1) {
    const renderedParts = getZonedDateParts(new Date(utcTime), timeZone);
    const renderedUtcTime = partsAsUtcTime({
      ...renderedParts,
      millisecond: parts.millisecond || 0,
    });

    utcTime += desiredUtcTime - renderedUtcTime;
  }

  return new Date(utcTime);
}

export function getPlatformDayRangeISOString(offset = 0, date = new Date()) {
  const { day, month, year } = getZonedDateParts(date);
  const start = zonedTimeToUtc({
    day: day + offset,
    hour: 0,
    millisecond: 0,
    minute: 0,
    month,
    year,
    second: 0,
  });
  const nextStart = zonedTimeToUtc({
    day: day + offset + 1,
    hour: 0,
    millisecond: 0,
    minute: 0,
    month,
    year,
    second: 0,
  });

  return {
    startTimeFrom: start.toISOString(),
    startTimeTo: new Date(nextStart.getTime() - 1).toISOString(),
  };
}

export function getTodayStartISOString() {
  return getPlatformDayRangeISOString().startTimeFrom;
}

export function getTodayEndISOString() {
  return getPlatformDayRangeISOString().startTimeTo;
}

export function chunkCards<T>(cards: T[], pageSize: number) {
  return cards.reduce<T[][]>((pages, card, index) => {
    const pageIndex = Math.floor(index / pageSize);
    pages[pageIndex] ||= [];
    pages[pageIndex].push(card);

    return pages;
  }, []);
}

export function getHomeCardHeight(size: HomeCardSizeLike) {
  const heights: Record<HomeCardSizeLike, string> = {
    compact: "h-full min-h-[174px]",
    hot: "h-[190px] 2xl:h-[205px]",
    carousel: "h-[200px] sm:h-[220px] 2xl:h-[244px]",
  };

  return heights[size];
}

export function slugifyLivePathSegment(value: string) {
  return (
    value
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "live"
  );
}

export function buildLiveDetailSlug(item: HomeLiveVideoItem) {
  const label =
    item.channel.live.roomName ||
    item.channel.live.liveName ||
    item.channel.title ||
    "live";

  return `${slugifyLivePathSegment(label)}-${item.channel._id}`;
}

export function buildLiveDetailHref(
  item: HomeLiveVideoItem,
  commentatorId?: string,
) {
  const href = `/live/${buildLiveDetailSlug(item)}`;

  return commentatorId
    ? `${href}?commentatorId=${encodeURIComponent(commentatorId)}`
    : href;
}

export function parseLiveSlug(channelSlug: string[]) {
  const fullSlug = channelSlug.join("-");
  const channelId =
    fullSlug.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{1,12})$/i,
    )?.[1] ||
    channelSlug.at(-1) ||
    fullSlug;
  const roomName = fullSlug.endsWith(channelId)
    ? fullSlug.slice(0, -channelId.length).replace(/-$/, "")
    : "";

  return { channelId, roomName };
}

export function getCategoryKind(name: string): CategoryKind {
  const normalizedName = normalizeSearchText(name);

  if (
    normalizedName.includes("the thao") ||
    normalizedName.includes("bong da") ||
    normalizedName.includes("football")
  ) {
    return "sports";
  }

  if (normalizedName.includes("esport")) {
    return "esports";
  }

  if (normalizedName.includes("casino")) {
    return "casino";
  }

  if (normalizedName.includes("idol")) {
    return "idol";
  }

  return "hot";
}

export function getMatchCategoryKind(
  match: Pick<LiveMatch, "categoryName" | "categoryNames" | "tournament" | "type">,
) {
  const categoryNames = getMatchNames(match);

  return (
    categoryNames
      .map(getCategoryKind)
      .find((kind) => kind === "sports" || kind === "esports") ||
    getCategoryKind(categoryNames[0] || "")
  );
}

export function isMatchCardCategory(item: HomeLiveVideoItem) {
  const names = getMatchSearchText(item.match);

  return (
    names.includes("the thao") ||
    names.includes("bong da") ||
    names.includes("bong ro") ||
    names.includes("basketball") ||
    names.includes("tennis") ||
    names.includes("bong chuyen") ||
    names.includes("volleyball") ||
    names.includes("bong ban") ||
    names.includes("table tennis") ||
    names.includes("football") ||
    names.includes("esport")
  );
}

export function isCasinoMatch(match: HomeLiveVideoItem["match"]) {
  return getMatchSearchText(match).includes("casino");
}

export function isIdolMatch(match: HomeLiveVideoItem["match"]) {
  return getMatchSearchText(match).includes("idol");
}

export function isEsportsMatch(match: HomeLiveVideoItem["match"]) {
  return getMatchSearchText(match).includes("esport");
}

export function formatMatchTime(startTime?: string) {
  if (!startTime) {
    return "--:--";
  }

  return new Date(startTime).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTodayMatchTime(match: Pick<TodayMatch, "startTime">) {
  return formatMatchTime(match.startTime);
}

export function formatMatchDate(startTime?: string) {
  if (!startTime) {
    return "--/--/----";
  }

  return new Date(startTime)
    .toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");
}

export function getInitials(value?: string, fallback = "L") {
  const words = value?.trim().split(/\s+/).filter(Boolean) || [];

  return (words[0]?.[0] || fallback).concat(words[1]?.[0] || "").toUpperCase();
}

export function getProfileInitial(value: string) {
  return Array.from(value.trim())[0]?.toUpperCase() || "U";
}

export function formatViewerCount(value?: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.max(value || 0, 0));
}

export function getLiveFooterNames(item: HomeLiveVideoItem, fallback = "Live") {
  const commentatorNames = item.channel.commentatorNames
    ?.map((name) => name.trim())
    .filter(Boolean);

  if (commentatorNames?.length) {
    return commentatorNames;
  }

  return [
    item.channel.live.commentatorName ||
      item.channel.live.liveName ||
      item.channel.title ||
      fallback,
  ];
}

export function getChannelStatusBadgeConfig(
  status?: LiveChannelStatus,
): ChannelStatusBadgeConfig {
  const configs: Record<LiveChannelStatus, ChannelStatusBadgeConfig> = {
    cancelled: {
      backgroundColor: "#6b7280",
      label: "Đã hủy",
    },
    finished: {
      backgroundColor: "#6b7280",
      label: "Kết thúc",
    },
    live: {
      backgroundColor: "#FF0000",
      label: "LIVE",
    },
    scheduled: {
      backgroundColor: "#F68C1F",
      label: "Sắp diễn ra",
    },
  };

  return status ? configs[status] : configs.live;
}

export function formatShortCommentatorId(id?: string) {
  if (!id) {
    return "7392e3a6";
  }

  if (id.length <= 12) {
    return id;
  }

  return `${id.slice(0, 6)}${id.slice(-6)}`;
}

export function parseBirthday(profile: BirthdaySource): BirthdayParts {
  if (profile?.birthDay || profile?.birthMonth || profile?.birthYear) {
    return {
      day: profile.birthDay || "",
      month: profile.birthMonth || "",
      year: profile.birthYear || "",
    };
  }

  if (profile?.birthday) {
    const dateParts = profile.birthday.includes("-")
      ? profile.birthday.split("-")
      : profile.birthday.split("/");

    if (dateParts.length === 3) {
      const [first, second, third] = dateParts;
      if (first.length === 4) {
        return {
          day: third.padStart(2, "0"),
          month: second.padStart(2, "0"),
          year: first,
        };
      }

      return {
        day: first.padStart(2, "0"),
        month: second.padStart(2, "0"),
        year: third,
      };
    }
  }

  return {
    day: "",
    month: "",
    year: "",
  };
}

export function buildBirthday(formValues: BirthdayParts) {
  if (!formValues.day || !formValues.month || !formValues.year) {
    return "";
  }

  return `${formValues.year}-${formValues.month}-${formValues.day}`;
}

export function formatBirthday(profile: BirthdayParts) {
  if (!profile.day || !profile.month || !profile.year) {
    return "";
  }

  return `${profile.day}.${profile.month}.${profile.year}`;
}

export function getCategoryIcon(name: string) {
  const normalizedName = normalizeSearchText(name);

  if (normalizedName.includes("bong ro") || normalizedName.includes("basket")) {
    return "🏀";
  }

  if (
    normalizedName.includes("lol") ||
    normalizedName.includes("league of legends")
  ) {
    return "Ⓛ";
  }

  if (normalizedName.includes("cs")) {
    return "CS";
  }

  if (normalizedName.includes("dota")) {
    return "▰";
  }

  return "⚽";
}

export function getEmptyMessage(day: MatchDayKeyLike) {
  const messages: Record<MatchDayKeyLike, string> = {
    yesterday: "Hôm qua chưa có trận đấu.",
    today: "Hôm nay chưa có trận đấu.",
    tomorrow: "Ngày mai chưa có trận đấu.",
  };

  return messages[day];
}

export function getSportIcon(categoryName?: string) {
  return normalizeSearchText(categoryName).includes("basket") ? "🏀" : "⚽";
}

export function getStatusLabel(status: TodayMatch["channelStatus"]) {
  const labels: Record<LiveChannelStatus, string> = {
    cancelled: "Đã hủy",
    finished: "Kết thúc",
    live: "Trực tiếp",
    scheduled: "Sắp diễn ra",
  };

  return status ? labels[status] || status : "";
}

function getMatchNames(
  match: Pick<LiveMatch, "categoryName" | "categoryNames" | "tournament" | "type">,
) {
  return [
    match.categoryName,
    ...(match.categoryNames || []),
    match.tournament,
    match.type,
  ].filter(Boolean) as string[];
}

function getMatchSearchText(
  match: Pick<LiveMatch, "categoryName" | "categoryNames" | "tournament" | "type">,
) {
  return normalizeSearchText(getMatchNames(match).join(" "));
}

function normalizeSearchText(value?: string) {
  return (value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
