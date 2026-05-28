"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeLiveCategoryCountsResponse } from "@/models/match";
import { getHomeLiveCategoryCounts } from "@/services/matches";

const categoryRows: Array<{
  categoryName?: string;
  href: string;
  iconSrc: string;
  key: string;
  label: string;
}> = [
  {
    href: "#hot-live",
    iconSrc: "/assets/icon_video_pannel/Group.svg",
    key: "hot",
    label: "Hot",
  },
  {
    categoryName: "Bóng đá",
    href: "#hot-live",
    iconSrc: "/assets/bongda.svg",
    key: "football",
    label: "Bóng đá",
  },
  {
    categoryName: "Bóng rổ",
    href: "#hot-live",
    iconSrc: "/assets/bongro.svg",
    key: "basketball",
    label: "Bóng rổ",
  },
  {
    categoryName: "Tennis",
    href: "#hot-live",
    iconSrc: "/assets/tenis.svg",
    key: "tennis",
    label: "Tennis",
  },
  {
    categoryName: "Bóng chuyền",
    href: "#hot-live",
    iconSrc: "/assets/bongchuyen.svg",
    key: "volleyball",
    label: "Bóng chuyền",
  },
  {
    categoryName: "Bóng bàn",
    href: "#hot-live",
    iconSrc: "/assets/bongban.svg",
    key: "table-tennis",
    label: "Bóng bàn",
  },
  {
    categoryName: "Esports",
    href: "#hot-live",
    iconSrc: "/assets/ic_white_esports.svg",
    key: "esports",
    label: "Esports",
  },
  {
    categoryName: "Casino",
    href: "#hot-live",
    iconSrc: "/assets/ic_white_casino.svg",
    key: "casino",
    label: "Casino",
  },
  {
    categoryName: "Idol live",
    href: "#hot-live",
    iconSrc: "/assets/ic_white_idol.svg",
    key: "idol",
    label: "Idol Live",
  },
];

const sidebarCategoryCountFallback = Object.fromEntries(
  categoryRows.map((row) => [row.key, 0]),
);

export function SunIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-[21px] shrink-0 text-[#c2c2c2]"
      fill="none"
      viewBox="0 0 21 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5 14.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4ZM10.5 0c.41 0 .75.34.75.75v2.08a.75.75 0 0 1-1.5 0V.75c0-.41.34-.75.75-.75ZM10.5 16.42c.41 0 .75.34.75.75v2.08a.75.75 0 0 1-1.5 0v-2.08c0-.41.34-.75.75-.75ZM20.5 10c0 .41-.34.75-.75.75h-2.08a.75.75 0 0 1 0-1.5h2.08c.41 0 .75.34.75.75ZM3.33 10c0 .41-.34.75-.75.75H.5a.75.75 0 0 1 0-1.5h2.08c.41 0 .75.34.75.75ZM17.57 2.93c.29.29.29.77 0 1.06L16.1 5.46a.75.75 0 0 1-1.06-1.06l1.47-1.47c.29-.29.77-.29 1.06 0ZM5.96 14.54c.29.29.29.77 0 1.06l-1.47 1.47a.75.75 0 1 1-1.06-1.06l1.47-1.47c.29-.29.77-.29 1.06 0ZM17.57 17.07a.75.75 0 0 1-1.06 0L15.04 15.6a.75.75 0 0 1 1.06-1.06l1.47 1.47c.29.29.29.77 0 1.06ZM5.96 5.46a.75.75 0 0 1-1.06 0L3.43 3.99a.75.75 0 0 1 1.06-1.06L5.96 4.4c.29.29.29.77 0 1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg
      aria-hidden
      className="h-5 w-5 shrink-0 text-[#c2c2c2]"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.91 12.94a7.08 7.08 0 0 1-8.85-8.85.7.7 0 0 0-.88-.88 8.5 8.5 0 1 0 10.61 10.61.7.7 0 0 0-.88-.88Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SidebarLiveBox({
  initialCategoryCounts,
}: {
  initialCategoryCounts?: HomeLiveCategoryCountsResponse;
}) {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    () => ({
      ...sidebarCategoryCountFallback,
      ...initialCategoryCounts,
    }),
  );
  const [isRefreshingCounts, setIsRefreshingCounts] = useState(false);
  const countsRequestIdRef = useRef(0);

  const loadCategoryCounts = useCallback(async () => {
    const requestId = countsRequestIdRef.current + 1;
    countsRequestIdRef.current = requestId;
    setIsRefreshingCounts(true);

    try {
      const nextCounts = await getHomeLiveCategoryCounts();

      if (countsRequestIdRef.current === requestId) {
        setCategoryCounts({
          ...sidebarCategoryCountFallback,
          ...nextCounts,
        });
      }
    } finally {
      if (countsRequestIdRef.current === requestId) {
        setIsRefreshingCounts(false);
      }
    }
  }, []);

  useEffect(() => {
    if (initialCategoryCounts) {
      setCategoryCounts({
        ...sidebarCategoryCountFallback,
        ...initialCategoryCounts,
      });
      return;
    }

    void loadCategoryCounts();

    return () => {
      countsRequestIdRef.current += 1;
    };
  }, [initialCategoryCounts, loadCategoryCounts]);

  return (
    <div className="pr-2.5">
      <div className="mb-[5px] flex h-9 items-center justify-between pl-[19px] text-[12px] font-semibold text-[#d7d7d7]">
        <span className="flex min-w-0 items-center gap-[8px]">
          <span className="relative h-5 w-5 shrink-0">
            <Image
              src="/assets/navbars/icon_live.svg"
              alt=""
              fill
              sizes="20px"
              className="object-contain opacity-80"
              aria-hidden
            />
          </span>
          <span className="truncate text-base">Danh Mục Phát Sóng</span>
        </span>
        <button
          className="relative h-6 w-6 shrink-0 cursor-pointer rounded-full transition hover:bg-white/10 disabled:cursor-default disabled:opacity-70"
          type="button"
          title="Cập nhật số lượng"
          aria-label="Cập nhật số lượng danh mục phát sóng"
          disabled={isRefreshingCounts}
          onClick={loadCategoryCounts}
        >
          <Image
            src="/assets/navbars/icon_reload.svg"
            alt=""
            fill
            sizes="14px"
            className={`object-contain p-[5px] opacity-80 ${
              isRefreshingCounts ? "animate-spin" : ""
            }`}
            aria-hidden
          />
        </button>
      </div>
      <div className="ml-[29px] text-base pr-2.5 py-[5px] grid gap-[2px] border-l border-[#ff8c13] pl-[10px] text-[12px] text-[#9f9f9f]">
        {categoryRows.map((row) => (
          <a
            key={row.key}
            className="flex h-9 items-center justify-between gap-2 text-base pr-4.75"
            href={row.href}
          >
            <span className="flex min-w-0 items-center gap-[7px]">
              <span className="relative h-[20px] w-[15px] shrink-0">
                <Image
                  src={row.iconSrc}
                  alt=""
                  fill
                  sizes="14px"
                  className="object-contain opacity-70"
                  aria-hidden
                />
              </span>
              <span className="truncate">{row.label}</span>
            </span>
            <div className="flex flex-row items-center shrink-0 font-normal text-white">
              <div className="w-[5px] h-[5px] rounded-full bg-[#ff8c13] mr-1.5"></div>
              {categoryCounts[row.key] || 0}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
