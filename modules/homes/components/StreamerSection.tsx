"use client";

import Image from "next/image";
import { useRef } from "react";
import { FullHeader } from "./HomeSectionHeaders";
import { streamerNames } from "./homeData";

export default function StreamerSection() {
  const scrollBoxRef = useRef<HTMLDivElement | null>(null);

  const scrollStreamers = (direction: "left" | "right") => {
    const scrollBox = scrollBoxRef.current;

    if (!scrollBox) {
      return;
    }

    scrollBox.scrollBy({
      behavior: "smooth",
      left:
        direction === "left" ? -scrollBox.clientWidth : scrollBox.clientWidth,
    });
  };

  return (
    <section id="streamers" className="mt-[22px]">
      <FullHeader iconSrc="/assets/ic_top_streamer.svg" title="Top Streamer" />
      <div className="flex min-h-[203px] items-center justify-between gap-5 rounded-b-2.5 bg-[#292929] px-4 py-5">
        <button
          className="relative h-[26px] w-[26px] shrink-0 cursor-pointer"
          type="button"
          onClick={() => scrollStreamers("left")}
          aria-label="Streamer trước"
        >
          <Image
            src="/assets/ic_arrow_left_streamer.svg"
            alt=""
            fill
            sizes="26px"
            className="object-contain"
            aria-hidden
          />
        </button>
        <div
          ref={scrollBoxRef}
          className="category-scroll-box flex w-full overflow-x-auto overflow-y-hidden pb-[12px]"
        >
          <div className="flex w-full min-w-max flex-row justify-between gap-5">
            {streamerNames.map((name, index) => (
              <div
                key={`${name}-${index}`}
                className="flex w-[92px] shrink-0 flex-col items-center justify-center 2xl:w-[123px]"
              >
                <div className="h-[80px] w-[80px] rounded-full border-[3px] border-[#ff8c13] bg-[radial-gradient(circle,#ffe2cd_0,#d96744_45%,#3d1a12_100%)]" />
                <div className="mt-1.5 w-[99px] truncate text-center text-[14px] font-bold">
                  {name}
                </div>
                <div className="mt-1 flex min-w-0 cursor-pointer items-center justify-center gap-[4px] rounded-[5px] bg-[#414141] px-1 py-1.25 text-[10px] text-[#d1d1d1]">
                  <Image
                    src="/assets/ic_user_streamer_un.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="h-3 w-3 shrink-0 object-contain"
                    aria-hidden
                  />
                  <span className="truncate text-[11px]">Theo dõi</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="relative h-[26px] w-[26px] shrink-0 cursor-pointer"
          type="button"
          onClick={() => scrollStreamers("right")}
          aria-label="Streamer tiếp theo"
        >
          <Image
            src="/assets/ic_arrow_right_streamer.svg"
            alt=""
            fill
            sizes="26px"
            className="object-contain"
            aria-hidden
          />
        </button>
      </div>
    </section>
  );
}
