import type { ReactNode } from "react";
import type { TodayMatch } from "@/models/match";
import {
  formatTodayMatchTime,
  getCategoryIcon,
  getSportIcon,
  getStatusLabel,
} from "@/helpers/string";
import { getMatchChannelStatus, type MatchDayKey } from "../../hooks/useTodayMatches";

const videoItems = [
  "User FieldFrenzy has posted a video.",
  "Chiến thắng chủ 4 liên tiếp",
  "Cặp song sát hủy diệt",
  "CR7 trở lại và lập hat-trick",
  "Gareth Bale hủy diệt Inter Milan",
  "Lực sút của Cr7 hơn 40 tuổi",
  "Gerrard chuyền bóng cho Torres",
];

const sidebarGroups = [
  {
    id: "sports",
    name: "Thể thao",
    children: ["Bóng đá", "Bóng rổ"],
  },
  {
    id: "esports",
    name: "Esports",
    children: ["Esports"],
  },
  {
    id: "casino",
    name: "Casino",
    children: ["Casino"],
  },
  {
    id: "idol",
    name: "Idol live",
    children: ["Idol live"],
  },
];

export function MatchSection({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: string;
  title: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3 text-sm font-medium">
        <span className="h-2 w-2 bg-[#303030]" />
        <span className="text-lg leading-none">{icon}</span>
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

export function LoadMoreButton() {
  return (
    <button
      className="mx-auto mt-5 block h-10 w-36 cursor-pointer rounded border border-[#c8c8c8] bg-white text-sm text-[#999] transition hover:border-[#999] hover:text-[#555]"
      type="button"
    >
      Thêm
    </button>
  );
}

export function SportsSidebar() {
  return (
    <aside className="hidden bg-white lg:block">
      <div className="flex h-[58px] items-center gap-3 border-b border-[#f0f0f0] px-4 font-semibold">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-[#7868ff] to-[#346dff] text-xs text-white">
          ★
        </span>
        <span>Nổi bật ⓘ</span>
      </div>

      {sidebarGroups.map((group) => (
        <div key={group.id} className="border-b border-[#f0f0f0] px-4 py-5">
          <div className="mb-6 flex items-center justify-between text-sm">
            <span>{group.name} (Thêm)</span>
            <span className="text-xs">●</span>
          </div>
          <div className="grid gap-7">
            {group.children.map((category) => (
              <div
                key={category}
                className="flex items-center gap-4 text-sm text-[#626262]"
              >
                <span className="w-7 text-center text-xl font-black">
                  {getCategoryIcon(category)}
                </span>
                <span>{category}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}

export function MatchTabs({
  activeDay,
  dayCounts,
  onDayChange,
}: {
  activeDay: MatchDayKey;
  dayCounts: Record<MatchDayKey, number>;
  onDayChange: (day: MatchDayKey) => void;
}) {
  const tabs: Array<{ key: MatchDayKey; label: string }> = [
    { key: "yesterday", label: "Hôm qua" },
    { key: "today", label: "Hôm nay" },
    { key: "tomorrow", label: "Ngày mai" },
  ];

  return (
    <div className="mb-7 flex flex-wrap items-center justify-center gap-6 text-base">
      {tabs.map((tab) => {
        const isActive = tab.key === activeDay;

        return (
          <button
            key={tab.key}
            className={
              isActive
                ? "cursor-pointer rounded-full bg-black px-5 py-2 font-semibold text-white"
                : "cursor-pointer text-[#444]"
            }
            type="button"
            onClick={() => onDayChange(tab.key)}
          >
            {tab.label}({dayCounts[tab.key]})
          </button>
        );
      })}
    </div>
  );
}

export function MatchCard({ match }: { match: TodayMatch }) {
  return (
    <article className="cursor-pointer rounded-lg border border-[#e5e7eb] bg-white px-5 py-4 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <span>{getSportIcon(match.categoryName)}</span>
          <span className="truncate">
            {match.tournament || match.categoryName || "Giải đấu"}
          </span>
          <span className="rounded bg-[#43d989] px-1.5 py-0.5 text-[10px] text-white">
            tv
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 font-medium">
          <span className="text-base leading-none">▮▮</span>
          <span>{getStatusLabel(getMatchChannelStatus(match))}</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_92px_1fr] items-center gap-3 text-center">
        <TeamBlock
          imageUrl={match.homeTeamImageUrl}
          name={match.homeTeamName}
          tone="blue"
        />
        <ScoreBlock match={match} />
        <TeamBlock
          imageUrl={match.awayTeamImageUrl}
          name={match.awayTeamName}
          tone="red"
        />
      </div>
    </article>
  );
}

export function MatchRow({ match }: { match: TodayMatch }) {
  const status = getMatchChannelStatus(match);
  const isFinished = status === "finished";
  const [homeScore = "0", awayScore = "0"] = match.score?.split("-") || [];

  return (
    <article className="cursor-pointer grid gap-3 bg-white px-4 py-4 text-sm sm:min-h-14 sm:grid-cols-[56px_minmax(120px,1fr)_minmax(120px,1.2fr)_32px_76px_32px_minmax(120px,1.2fr)_64px] sm:items-center sm:gap-2">
      <div className="font-medium text-[#303030]">
        {formatTodayMatchTime(match)}
      </div>

      <div className="flex min-w-0 items-center gap-2 text-xs text-[#303030]">
        <span>{getSportIcon(match.categoryName)}</span>
        <span className="line-clamp-2">
          {match.tournament || match.categoryName || "Giải đấu"}
        </span>
      </div>

      <TeamInline
        imageUrl={match.homeTeamImageUrl}
        name={match.homeTeamName}
        align="right"
      />

      <ScoreCell value={isFinished ? homeScore : "-"} strong={isFinished} />

      <span
        className={`flex h-5 min-w-[78px] items-center justify-center justify-self-center whitespace-nowrap rounded-full px-2 text-[10px] ${
          isFinished
            ? "bg-[#f0f0f0] text-[#999]"
            : "bg-[#f5f5f5] text-[#aaa]"
        }`}
      >
        {getStatusLabel(status)}
      </span>

      <ScoreCell value={isFinished ? awayScore : "-"} strong={isFinished} />

      <TeamInline imageUrl={match.awayTeamImageUrl} name={match.awayTeamName} />

      <div className="flex items-center justify-end gap-4 text-lg">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded text-xs text-white ${
            isFinished ? "bg-[#ffa64d]" : "bg-[#7185ff]"
          }`}
        >
          ▱
        </span>
        <span className="text-[#b8b8b8]">♡</span>
      </div>
    </article>
  );
}

function TeamInline({
  align = "left",
  imageUrl,
  name,
}: {
  align?: "left" | "right";
  imageUrl?: string;
  name: string;
}) {
  const logo = imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={name}
      className="h-7 w-7 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-xs font-black">
      {name.charAt(0).toUpperCase()}
    </span>
  );
  const nameNode = <span className="truncate">{name}</span>;

  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        align === "right" ? "justify-end text-right" : ""
      }`}
    >
      {align === "right" ? (
        <>
          {nameNode}
          {logo}
        </>
      ) : (
        <>
          {logo}
          {nameNode}
        </>
      )}
    </div>
  );
}

function ScoreCell({ strong, value }: { strong: boolean; value: string }) {
  return (
    <span
      className={`justify-self-center text-center ${
        strong ? "text-base font-black text-[#303030]" : "font-semibold"
      }`}
    >
      {value}
    </span>
  );
}

function TeamBlock({
  imageUrl,
  name,
  tone,
}: {
  imageUrl?: string;
  name: string;
  tone: "blue" | "red";
}) {
  return (
    <div className="min-w-0">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="mx-auto mb-3 h-11 w-11 rounded-full object-cover"
        />
      ) : (
        <div
          className={`cursor-pointer mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-white text-lg font-black ${
            tone === "blue"
              ? "border-[#168bd1] text-[#168bd1]"
              : "border-[#e24031] text-[#e24031]"
          }`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="truncate text-xs">{name}</div>
    </div>
  );
}

function ScoreBlock({ match }: { match: TodayMatch }) {
  const [homeScore = "0", awayScore = "0"] = match.score?.split("-") || [];

  return (
    <div className="grid gap-2 text-sm font-black">
      <div className="grid grid-cols-[1fr_20px_1fr] items-center gap-2">
        <span>{homeScore}</span>
        <span className="text-xs text-[#45c17a]">◢</span>
        <span>{awayScore}</span>
      </div>
      <div className="grid grid-cols-[1fr_20px_1fr] items-center gap-1 text-xs font-bold">
        <span className="justify-self-end rounded bg-[#ff4d4f] px-1 text-white">
          0
        </span>
        <span className="text-[#5866a8]">▣</span>
        <span className="justify-self-start rounded bg-[#ffb13b] px-1 text-white">
          0
        </span>
      </div>
    </div>
  );
}

export function VideoSidebar() {
  return (
    <aside className="hidden bg-white p-3 lg:block">
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 bg-[#303030]" />
          <span>📺 Video</span>
        </div>
        <button className="cursor-pointer text-xs text-[#999]" type="button">
          Thêm 〉
        </button>
      </div>

      <div className="grid gap-3">
        {videoItems.map((title, index) => (
          <article key={title} className="grid grid-cols-[142px_1fr] gap-3">
            <div className="relative h-20 overflow-hidden rounded bg-gradient-to-br from-[#223b22] via-[#6d8f31] to-[#243c7a]">
              <div className="absolute inset-x-0 bottom-0 bg-black/45 px-1 text-right text-[10px] text-white">
                01:{String(40 - index * 4).padStart(2, "0")}
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-xs leading-5">{title}</h3>
              <p className="mt-2 truncate text-[10px] text-[#a4a4a4]">
                GameGladiator
              </p>
              <p className="mt-2 text-[10px] text-[#bbb]">
                ◎ 0 ♡ {1551 - index * 137}
              </p>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

export function StateMessage({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={`rounded-lg border bg-white px-5 py-8 text-center text-sm ${
        tone === "error"
          ? "border-red-100 text-red-500"
          : "border-[#e5e7eb] text-[#777]"
      }`}
    >
      {children}
    </div>
  );
}
