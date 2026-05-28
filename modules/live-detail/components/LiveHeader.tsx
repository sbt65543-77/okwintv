"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { formatShortCommentatorId } from "@/helpers/string";
import type { HomeLiveChannelItem } from "@/models/match";
import { getAssetImageUrl } from "@/services/homeAssets";
import { profileVideoAssets } from "./liveDetailAssets";

export default function LiveHeader({
  avatarUrl,
  commentator,
  commentatorId,
  commentatorOptions = [],
  matchTitle,
  onSelectCommentator,
  roomName,
  selectedCommentatorIndex = 0,
  viewerCount,
}: {
  avatarUrl?: string;
  commentator?: string;
  commentatorId?: string;
  commentatorOptions?: HomeLiveChannelItem[];
  matchTitle: string;
  onSelectCommentator?: (index: number) => void;
  roomName?: string;
  selectedCommentatorIndex?: number;
  viewerCount?: number;
}) {
  const [isCommentatorMenuOpen, setIsCommentatorMenuOpen] = useState(false);
  const commentatorMenuRef = useRef<HTMLDivElement | null>(null);
  const avatarImageUrl =
    avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.includes("/"))
      ? getAssetImageUrl(avatarUrl)
      : "";
  const formattedViewerCount = new Intl.NumberFormat("vi-VN").format(
    viewerCount || 0,
  );
  const shortCommentatorId = formatShortCommentatorId(commentatorId);
  const canSwitchCommentator = commentatorOptions.length > 1;

  useEffect(() => {
    if (!isCommentatorMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const menuElement = commentatorMenuRef.current;

      if (menuElement?.contains(event.target as Node)) {
        return;
      }

      setIsCommentatorMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCommentatorMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCommentatorMenuOpen]);

  return (
    <div className="flex min-h-[48px] items-center gap-[6px] rounded-t-[10px] bg-[#282828] px-[8px] py-[5px] sm:min-h-[60px] sm:gap-[8px] sm:px-[10px] xl:h-[60px] xl:gap-0 2xl:h-[60px]">
      <div className="flex min-w-0 flex-1 items-center gap-[6px] sm:gap-[10px] xl:h-full">
        <div className="relative flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#8c421d] bg-[#4b4b4b] text-[12px] font-black text-white sm:h-[50px] sm:w-[50px] sm:text-[16px]">
          {avatarImageUrl ? (
            <Image
              src={avatarImageUrl}
              alt={commentator || ""}
              fill
              sizes="(min-width: 640px) 50px, 42px"
              className="object-cover"
            />
          ) : (
            commentator?.slice(0, 1).toUpperCase() || "L"
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h1 className="truncate text-[13px] font-semibold leading-[17px] text-[#f68c1f] sm:text-[18px] sm:leading-[22px] 2xl:text-[22px] 2xl:leading-[26px]">
            {matchTitle}
          </h1>
          <div className="flex min-w-0 items-center gap-[6px] overflow-hidden whitespace-nowrap text-[10px] font-medium leading-[14px] text-[#c2c2c2] sm:gap-[12px] sm:text-[14px] sm:leading-[18px] 2xl:gap-[18px] 2xl:text-[16px] 2xl:leading-[20px]">
            <span className="flex min-w-0 items-center gap-[4px] sm:shrink-0 sm:gap-[6px] 2xl:gap-[8px]">
              <Image
                src={profileVideoAssets.video}
                alt=""
                width={15}
                height={9}
                className="h-[9px] w-[15px] shrink-0 sm:h-[11px] sm:w-[19px]"
                aria-hidden
              />
              <span className="min-w-0 truncate">{commentator || "BLV"}</span>
            </span>
            <span className="hidden min-w-0 truncate sm:inline">
              Phòng: {roomName || "Live"}
            </span>
            <span className="flex shrink-0 items-center gap-[3px] sm:gap-[5px]">
              <Image
                src={profileVideoAssets.hot}
                alt=""
                width={10}
                height={12}
                className="h-[12px] w-[10px] object-contain sm:h-[17px] sm:w-[14px]"
                aria-hidden
              />
              {formattedViewerCount}
            </span>
            <span className="hidden shrink-0 lg:inline">
              ID BLV: {shortCommentatorId}
            </span>
            <span className="hidden shrink-0 items-center gap-[5px] sm:flex">
              <Image
                src={profileVideoAssets.eye}
                alt=""
                width={20}
                height={12}
                aria-hidden
              />
              {formattedViewerCount}
            </span>
          </div>
        </div>
      </div>
      <div
        ref={commentatorMenuRef}
        className="relative flex h-[32px] shrink-0 items-center gap-[4px] sm:ml-[12px] sm:h-[38px] sm:gap-[8px] xl:h-full xl:items-end xl:gap-[10px] 2xl:gap-[20px]"
      >
        <button
          className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center gap-[3px] rounded-[5px] border border-[#c2c2c2] bg-[#282828] px-[4px] text-[12px] font-medium text-[#c2c2c2] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[38px] sm:w-[42px] sm:px-[5px] sm:text-[14px] 2xl:w-[170px]"
          disabled={!canSwitchCommentator}
          type="button"
          onClick={() => setIsCommentatorMenuOpen((value) => !value)}
        >
          <Image
            src={profileVideoAssets.mic}
            alt=""
            width={18}
            height={17}
            className="h-[17px] w-[18px] sm:h-[20px] sm:w-[21px]"
            aria-hidden
          />
          <span className="hidden 2xl:inline">Đổi Bình Luận Viên</span>
        </button>
        {isCommentatorMenuOpen && canSwitchCommentator ? (
          <div className="absolute right-0 top-[40px] z-[60] w-[230px] overflow-hidden rounded-[6px] border border-[#4a4a4a] bg-[#1f1f1f] shadow-[0_12px_30px_rgba(0,0,0,0.45)] sm:right-[86px] sm:top-[48px] 2xl:right-[240px] 2xl:top-[56px]">
            {commentatorOptions.map((option, index) => {
              const optionName =
                option.commentatorName || option.liveName || `BLV ${index + 1}`;
              const optionAvatarUrl =
                option.commentatorAvatarUrl &&
                (option.commentatorAvatarUrl.startsWith("http") ||
                  option.commentatorAvatarUrl.includes("/"))
                  ? getAssetImageUrl(option.commentatorAvatarUrl)
                  : "";
              const isSelected = index === selectedCommentatorIndex;

              return (
                <button
                  key={`${option.roomName || option.liveName || "live"}-${option.commentatorId || index}`}
                  className={`flex w-full min-w-0 cursor-pointer items-center gap-2 px-3 py-2 text-left text-[13px] leading-[18px] transition ${
                    isSelected
                      ? "bg-[#f68c1f] text-white"
                      : "text-[#d8d8d8] hover:bg-[#333]"
                  }`}
                  type="button"
                  onClick={() => {
                    onSelectCommentator?.(index);
                    setIsCommentatorMenuOpen(false);
                  }}
                >
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4b4b4b] text-[12px] font-black text-white">
                    {optionAvatarUrl ? (
                      <Image
                        src={optionAvatarUrl}
                        alt={optionName}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      optionName.slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    {optionName}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
        <button className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center gap-[5px] rounded-[5px] border border-[#c2c2c2] bg-[#282828] px-[6px] text-[12px] font-medium text-[#c2c2c2] sm:h-[38px] sm:w-[42px] sm:px-[10px] sm:text-[14px] 2xl:w-[100px]">
          <Image
            src={profileVideoAssets.share}
            alt=""
            width={17}
            height={17}
            className="h-[17px] w-[17px] sm:h-[20px] sm:w-[20px]"
            aria-hidden
          />
          <span className="hidden 2xl:inline">Chia sẻ</span>
        </button>
        <button className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center gap-[5px] rounded-[5px] bg-[linear-gradient(180deg,#fd8901_0%,#ffa54e_100%)] px-[4px] text-[12px] font-medium text-white sm:h-[38px] sm:w-[42px] sm:px-[5px] sm:text-[14px] 2xl:w-[100px]">
          <Image
            src={profileVideoAssets.follow}
            alt=""
            width={16}
            height={17}
            className="h-[17px] w-[16px] sm:h-[20px] sm:w-[19px]"
            aria-hidden
          />
          <span className="hidden 2xl:inline">Theo dõi</span>
        </button>
      </div>
    </div>
  );
}
