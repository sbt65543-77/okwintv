"use client";

import { useMemo, useRef } from "react";
import type { HomeLiveVideoItem } from "@/models/match";
import {
  FeatureTile,
  ChannelLiveCard,
  CATEGORY_BANNER_BACKGROUND_SRC,
  categoryCarouselVisuals,
} from "./HomeCards";
import { CarouselArrow, CategoryHeader } from "./HomeSectionHeaders";
import { useHomeLiveVideos } from "../hooks/useHomeLiveVideos";
import type { SectionKind } from "./homeData";

const DEFAULT_FEATURE_CLASS_NAME =
  "absolute left-[-45px] top-[40px] z-10 h-[340px] w-[340px]";

export default function CategoryCarouselSection({
  categoryName,
  feature,
  id,
  initialItems,
  kind,
  title,
}: {
  categoryName: string;
  feature: "sports" | "esports" | "casino" | "idol";
  id: string;
  initialItems?: HomeLiveVideoItem[];
  kind: SectionKind;
  title: string;
}) {
  const { error, isLoading, items } = useHomeLiveVideos({
    categoryName,
    initialItems,
    status: "not_finished",
  });
  const visual = categoryCarouselVisuals[feature];
  const scrollBoxRef = useRef<HTMLDivElement | null>(null);
  const cards = useMemo(() => {
    return items.map((item) => (
      <ChannelLiveCard
        key={item.id}
        feature={feature}
        item={item}
        size="carousel"
      />
    ));
  }, [feature, items]);
  const hasCards = items.length > 0;
  const scrollCards = (direction: "left" | "right") => {
    const scrollBox = scrollBoxRef.current;

    if (!scrollBox) {
      return;
    }

    scrollBox.scrollBy({
      behavior: "smooth",
      left: direction === "left" ? -scrollBox.clientWidth : scrollBox.clientWidth,
    });
  };

  return (
    <section id={id} className="mt-[18px] sm:mt-[28px]">
      <CategoryHeader kind={feature} title={title} />
      <div
        className="relative overflow-hidden rounded-[8px] border border-[#f68c1f] bg-cover bg-center p-[8px] sm:rounded-[10px] sm:p-[10px] lg:h-[270px] lg:p-0"
        style={{ backgroundImage: `url('${CATEGORY_BANNER_BACKGROUND_SRC}')` }}
      >
        <FeatureTile
          className={`hidden lg:block ${
            visual.featureClassName || DEFAULT_FEATURE_CLASS_NAME
          }`}
          type={feature}
        />
        <div className="relative z-30 w-full lg:absolute lg:right-[64px] lg:top-[19px] lg:w-[calc(100%_-_372px)]">
          {hasCards ? (
            <div
              ref={scrollBoxRef}
              className="category-scroll-box overflow-x-auto overflow-y-hidden pb-[8px] sm:pb-[12px]"
            >
              <div className="grid auto-cols-[minmax(245px,1fr)] grid-flow-col gap-[10px] min-[375px]:auto-cols-[minmax(290px,1fr)] sm:auto-cols-[calc((100%_-_15px)_/_2)] sm:gap-[15px] xl:auto-cols-[calc((100%_-_30px)_/_3)]">
                {cards}
              </div>
            </div>
          ) : (
            <div className="flex h-[150px] items-center justify-center rounded-[5px] border border-[#f68c1f]/50 bg-black/45 px-4 text-center text-[13px] font-semibold text-white/80 sm:h-[204px] sm:text-[15px]">
              {error
                ? "Không thể tải phiên live"
                : isLoading
                ? "Đang tải phiên live..."
                : "Hiện chưa có phiên live nào"}
            </div>
          )}
        </div>
        {hasCards ? (
          <>
            <CarouselArrow direction="left" onClick={() => scrollCards("left")} />
            <CarouselArrow onClick={() => scrollCards("right")} />
          </>
        ) : null}
      </div>
    </section>
  );
}
