"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { HomeLiveCategoryCountsResponse } from "@/models/match";
import { sidebarItems } from "../homeData";
import { MoonIcon, SidebarLiveBox, SunIcon } from "./HomeSidebarParts";

const sidebarScrollClass =
  "overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] [scrollbar-color:#ff8c13_#333] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#ff8c13]";

export default function HomeSidebar({
  customerSupportUrl,
  initialCategoryCounts,
  onNavigate,
  variant = "desktop",
}: {
  customerSupportUrl?: string;
  initialCategoryCounts?: HomeLiveCategoryCountsResponse;
  onNavigate?: () => void;
  variant?: "desktop" | "drawer";
}) {
  const isDrawer = variant === "drawer";
  const pathname = usePathname() || "/";
  const utilityRows = [
    {
      icon: "/assets/navbars/cskh.svg",
      label: "CSKH",
      badge: "24/7",
      href: customerSupportUrl,
    },
    { icon: "/assets/navbars/cskh.svg", label: "Cộng Đồng" },
    { icon: "/assets/navbars/info.svg", label: "Hỏi Đáp Về OKWINTV" },
  ];

  return (
    <aside
      className={
        isDrawer
          ? "h-full w-[250px] touch-pan-y overflow-hidden border-r border-[#9b651f] bg-[#242424]"
          : "sticky top-[60px] h-[calc(100vh-60px)] w-[250px] self-start overflow-hidden border-r border-[#9b651f] bg-[#242424]"
      }
    >
      <nav
        className={`flex h-full flex-col pb-[9px] pt-[15px] text-[13px] font-medium text-[#bdbdbd] ${sidebarScrollClass}`}
      >
        <div className="grid gap-2.5 pr-5">
          {sidebarItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href.startsWith("/")
                  ? pathname.startsWith(item.href)
                  : item.active;

            return (
              <a
                key={item.label}
                className={`group relative flex  h-7.5 items-center gap-[5px] overflow-hidden py-[5px] pr-[8px] transition focus-visible:outline-none ${
                  isActive
                    ? "rounded-r-[10px] bg-[#515151] font-medium text-[#fd8901]"
                    : "rounded-[5px] text-[#c2c2c2] hover:rounded-r-[10px] hover:bg-[#515151] hover:pl-0 hover:text-[#fd8901] focus-visible:rounded-r-[10px] focus-visible:bg-[#515151] focus-visible:pl-0 focus-visible:text-[#fd8901]"
                }`}
                href={item.href}
                onClick={onNavigate}
              >
              <span
                className={`h-[36px] w-[10px] mr-[9px] shrink-0 rounded-r-[10px] bg-[linear-gradient(180deg,#FD8901_0%,#FFA54E_100%)] transition-[width,opacity] ${
                  isActive
                    ? "opacity-100"
                    : "w-0 opacity-0 group-hover:w-[10px] group-hover:opacity-100 group-focus-visible:w-[10px] group-focus-visible:opacity-100"
                }`}
                aria-hidden
              />
              <span className="relative h-5 w-5 shrink-0">
                <Image
                  src={item.iconSrc}
                  alt=""
                  fill
                  sizes="20px"
                  className={`object-contain transition ${
                    isActive
                      ? "opacity-100 [filter:brightness(0)_saturate(100%)_invert(54%)_sepia(100%)_saturate(1552%)_hue-rotate(359deg)_brightness(101%)_contrast(98%)]"
                      : "opacity-70 group-hover:opacity-100 group-hover:[filter:brightness(0)_saturate(100%)_invert(54%)_sepia(100%)_saturate(1552%)_hue-rotate(359deg)_brightness(101%)_contrast(98%)] group-focus-visible:opacity-100 group-focus-visible:[filter:brightness(0)_saturate(100%)_invert(54%)_sepia(100%)_saturate(1552%)_hue-rotate(359deg)_brightness(101%)_contrast(98%)]"
                  }`}
                  aria-hidden
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium capitalize leading-5">
                {item.label}
              </span>
              {"badge" in item && item.badge ? (
                <span className="text-[11px] leading-none">{item.badge}</span>
              ) : null}
              </a>
            );
          })}
        </div>
        <div className="pr-5 pl-2.5">
          <div className="w-full h-px bg-white my-2.5"></div>
        </div>
        <SidebarLiveBox initialCategoryCounts={initialCategoryCounts} />

        <div className="mt-[18px] grid gap-[10px] border-t border-[#777]/60 pt-[8px]">
          {utilityRows.map((item) =>
            item.href ? (
              <a
                key={item.label}
                className="group flex h-[36px] items-center justify-between gap-2 rounded-r-[10px] pl-[15px] text-[#c2c2c2] transition hover:bg-[#515151] hover:text-[#fd8901]"
                href={item.href}
                rel="noreferrer"
                target="_blank"
                onClick={onNavigate}
              >
                <UtilityRowContent item={item} />
              </a>
            ) : (
              <div
              key={item.label}
              className="group flex h-[36px] items-center justify-between gap-2 rounded-r-[10px] pl-[15px] text-[#c2c2c2] transition hover:bg-[#515151] hover:text-[#fd8901]"
            >
                <UtilityRowContent item={item} />
              </div>
            ),
          )}
        </div>
        <div className="pl-[10px]">
          <button className="group mt-[6px] p-1.25 flex h-[36px] w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] text-left text-[#c2c2c2] transition hover:bg-[#515151] hover:text-[#fd8901] bg-[#515151]">
            <span className="flex min-w-0 items-center gap-[5px]">
              <span className="relative h-5 w-5 shrink-0">
                <Image
                  src="/assets/navbars/ic_mic.svg"
                  alt=""
                  fill
                  sizes="20px"
                  className="object-contain opacity-70 transition group-hover:opacity-100"
                  aria-hidden
                />
              </span>
              <span className="truncate text-[14px] font-medium capitalize leading-5">
                Ứng Tuyển BLV
              </span>
            </span>
            <span className="shrink-0 flex justify-center items-center rounded-full bg-[linear-gradient(0deg,#FD8901_0%,#FFA54E_100%)] text-[13px] font-bold leading-[14px] text-white w-20 h-5">
              Xem ngay
            </span>
          </button>
        </div>

        <div className="px-2.5">
          <div className="mt-2.5 inline-flex w-full items-center justify-center overflow-hidden rounded-[10px] bg-[#515151] p-[5px]">
            <button className="flex h-[26px] w-[110px] items-center justify-center gap-[5px] rounded-[5px] px-[10px] py-[6px] text-[#c2c2c2] shadow-[0_0_4px_rgba(0,0,0,0.10)]">
              <SunIcon />
              <span className="text-[14px] font-medium capitalize leading-5">
                Sáng
              </span>
            </button>
            <button className="flex h-[26px] w-[110px] items-center justify-center gap-[5px] rounded-[5px] bg-[#282828] px-[10px] py-[6px] text-[#c2c2c2]">
              <MoonIcon />
              <span className="text-[14px] font-medium capitalize leading-5">
                Tối
              </span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}

function UtilityRowContent({
  item,
}: {
  item: { icon: string; label: string; badge?: string };
}) {
  return (
    <>
      <span className="flex min-w-0 items-center gap-[5px]">
        <span className="relative h-5 w-5 shrink-0">
          <Image
            src={item.icon}
            alt=""
            fill
            sizes="20px"
            className="object-contain opacity-70 transition group-hover:opacity-100"
            aria-hidden
          />
        </span>
        <span className="truncate text-[14px] font-medium capitalize leading-5">
          {item.label}
        </span>
      </span>
      {item.badge ? (
        <span className="shrink-0 rounded-full bg-[linear-gradient(0deg,#FD8901_0%,#FFA54E_100%)] px-[8px] py-[1px] text-[10px] font-bold leading-[14px] text-white">
          {item.badge}
        </span>
      ) : null}
    </>
  );
}
