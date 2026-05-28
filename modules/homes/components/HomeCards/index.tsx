import Image from "next/image";
import type { HomeLiveVideoItem } from "@/models/match";
import { isCasinoMatch, isIdolMatch, isMatchCardCategory } from "@/helpers/string";
import type { CardItem } from "../homeData";
import {
  GenericChannelLiveCard,
  LiveCardLink,
  MatchCard,
  MediaCard,
  SportsChannelLiveCard,
  VisualChannelLiveCard,
} from "./HomeCardParts";

export type CardSize = "compact" | "hot" | "carousel";
export type CategoryFeature = "sports" | "esports" | "casino" | "idol";

export const CATEGORY_BANNER_BACKGROUND_SRC = "/assets/bg_sports_banner.png";

export const categoryCarouselVisuals: Record<
  CategoryFeature,
  {
    featureImageSrc?: string;
    featureClassName?: string;
  }
> = {
  sports: {
    featureImageSrc: "/assets/bg_messi_sports.png",
    featureClassName: "absolute left-[-60px] top-0 z-10 h-[310px] w-[401px]",
  },
  esports: {
    featureImageSrc: "/assets/bg_esports.png",
    featureClassName:
      "absolute left-[-90px] top-[0px] z-10 h-[460px] w-[507px]",
  },
  casino: {
    featureImageSrc: "/assets/img_bg_casino.png",
    featureClassName:
      "absolute left-[0px] top-[-100px] z-10 h-[452px] w-[507px]",
  },
  idol: {
    featureImageSrc: "/assets/img_bg_idol.png",
    featureClassName:
      "absolute left-[0px] top-[-30px] z-10 h-[331px] w-[507px]",
  },
};

export function LiveCard({
  feature,
  item,
  size,
}: {
  feature?: CategoryFeature;
  item: CardItem;
  size: CardSize;
}) {
  if (item.kind === "match") {
    return <MatchCard feature={feature} item={item} size={size} />;
  }

  return <MediaCard item={item} size={size} />;
}

export function ChannelLiveCard({
  feature,
  item,
  size,
}: {
  feature?: CategoryFeature;
  item: HomeLiveVideoItem;
  size: CardSize;
}) {
  const match = item.match;

  if (feature === "casino" || isCasinoMatch(match)) {
    return (
      <LiveCardLink item={item}>
        <VisualChannelLiveCard item={item} size={size} variant="casino" />
      </LiveCardLink>
    );
  }

  if (feature === "idol" || isIdolMatch(match)) {
    return (
      <LiveCardLink item={item}>
        <VisualChannelLiveCard item={item} size={size} variant="idol" />
      </LiveCardLink>
    );
  }

  if (isMatchCardCategory(item)) {
    return (
      <LiveCardLink item={item}>
        <SportsChannelLiveCard feature={feature} item={item} size={size} />
      </LiveCardLink>
    );
  }

  return (
    <LiveCardLink item={item}>
      <GenericChannelLiveCard item={item} size={size} />
    </LiveCardLink>
  );
}

export function FeatureTile({
  className,
  type,
}: {
  className?: string;
  type: CategoryFeature;
}) {
  const visual = categoryCarouselVisuals[type];
  const copy = {
    sports: ["LAKERS", "23", "Messi"],
    esports: ["Faker", "Victory", "LOL"],
    casino: ["OK", "Jackpot", "777"],
    idol: ["Idol Live", "OK", "Live"],
  }[type];

  return (
    <div
      className={
        className ||
        "relative h-[350px] overflow-hidden rounded-[4px] bg-[radial-gradient(circle_at_55%_45%,#ffe083_0,#fb9514_35%,#45230b_100%)] sm:h-[220px] 2xl:h-[270px]"
      }
    >
      {visual.featureImageSrc ? (
        <Image
          src={visual.featureImageSrc}
          alt=""
          fill
          className="object-contain"
          sizes="(min-width: 1024px) 507px, 0px"
          priority={type === "sports"}
          aria-hidden
        />
      ) : null}
      {visual.featureImageSrc ? null : (
        <>
          <div className="absolute left-6 top-6 text-[38px] font-black uppercase leading-none text-white/95 sm:text-[46px] 2xl:text-[54px]">
            {copy[0]}
          </div>
          <div className="absolute bottom-5 left-7 text-[22px] font-black text-[#202020] 2xl:text-[28px]">
            {copy[1]}
          </div>
          <div className="absolute bottom-5 right-6 rounded-full bg-black/50 px-4 py-2 text-[15px] font-black 2xl:text-[18px]">
            {copy[2]}
          </div>
        </>
      )}
    </div>
  );
}
