"use client";

import { useEffect, useState } from "react";
import type {
  HomeLiveCategoryCountsResponse,
  HomeLiveVideoItem,
} from "@/models/match";
import type { HomeAssets } from "@/services/homeAssets";
import AboutSection from "./AboutSection";
import CategoryCarouselSection from "./CategoryCarouselSection";
import GiftSection from "./GiftSection";
import HomeHeroSection from "./HomeHeroSection";
import HomeSidebar from "./HomeSidebar";
import HotLiveSection from "./HotLiveSection";
import MobileHomeScreen from "./MobileHomeScreen";
import NewsSection from "./NewsSection";
import PromoSection from "./PromoSection";
import StreamerSection from "./StreamerSection";
import VideoSection from "./VideoSection";
import { homeCategories, type HomeCategory } from "./homeData";

const mobileHomeMediaQuery = "(max-width: 639px)";
const desktopSidebarMediaQuery = "(min-width: 1536px)";

type HomeLayoutMatches = {
  isMobile: boolean;
  showDesktopSidebar: boolean;
};

function useHomeLayoutMatches() {
  const [layoutMatches, setLayoutMatches] = useState<HomeLayoutMatches | null>(
    null,
  );

  useEffect(() => {
    const mobileQuery = window.matchMedia(mobileHomeMediaQuery);
    const desktopSidebarQuery = window.matchMedia(desktopSidebarMediaQuery);
    const updateLayoutMatches = () => {
      setLayoutMatches({
        isMobile: mobileQuery.matches,
        showDesktopSidebar: desktopSidebarQuery.matches,
      });
    };

    updateLayoutMatches();
    mobileQuery.addEventListener("change", updateLayoutMatches);
    desktopSidebarQuery.addEventListener("change", updateLayoutMatches);

    return () => {
      mobileQuery.removeEventListener("change", updateLayoutMatches);
      desktopSidebarQuery.removeEventListener("change", updateLayoutMatches);
    };
  }, []);

  return layoutMatches;
}

export default function OkwinHomeScreen({
  categoryLiveVideos,
  customerSupportUrl,
  heroPanelLiveItems,
  homeAssets,
  homeLiveCategoryCounts,
  hotLiveItems,
}: {
  categoryLiveVideos: Partial<Record<HomeCategory["id"], HomeLiveVideoItem[]>>;
  customerSupportUrl?: string;
  heroPanelLiveItems: HomeLiveVideoItem[];
  homeAssets: HomeAssets;
  homeLiveCategoryCounts: HomeLiveCategoryCountsResponse;
  hotLiveItems: HomeLiveVideoItem[];
}) {
  const layoutMatches = useHomeLayoutMatches();

  if (!layoutMatches) {
    return <div className="min-h-screen bg-[#111]" />;
  }

  if (layoutMatches.isMobile) {
    return (
      <MobileHomeScreen
        categoryLiveVideos={categoryLiveVideos}
        heroPanelLiveItems={heroPanelLiveItems}
        homeAssets={homeAssets}
        homeLiveCategoryCounts={homeLiveCategoryCounts}
        hotLiveItems={hotLiveItems}
      />
    );
  }

  return (
    <main id="home" className="min-h-screen bg-[#252525] text-white">
      <div className="mx-auto grid max-w-[1920px] grid-cols-1 pt-[60px] 2xl:grid-cols-[250px_minmax(0,1fr)]">
        {layoutMatches.showDesktopSidebar ? (
          <div>
            <HomeSidebar
              customerSupportUrl={customerSupportUrl}
              initialCategoryCounts={homeLiveCategoryCounts}
            />
          </div>
        ) : null}
        <div className="min-h-[calc(100vh-60px)] min-w-0 overflow-hidden bg-[#111] px-4 pb-0 pt-[14px] sm:px-5 md:px-8 2xl:px-8 2xl:pt-[15px]">
          <div className="mx-auto w-full 2xl:max-w-[min(1420px,calc(100vw_-_314px))] max-w-[min(1420px,calc(100vw_-_100px))]">
            <HomeHeroSection
              initialPanelLiveItems={heroPanelLiveItems}
              initialBannerImageUrls={homeAssets.bannerPcImageUrls}
            />
            <HotLiveSection
              enableMobileCounts={false}
              initialCategoryCounts={homeLiveCategoryCounts}
              initialItems={hotLiveItems}
            />
            {homeCategories.map((category) => (
              <CategoryCarouselSection
                key={category.id}
                id={category.sectionId}
                title={category.title}
                kind={category.kind}
                feature={category.id}
                categoryName={category.apiCategoryName}
                initialItems={categoryLiveVideos[category.id] || []}
              />
            ))}
            <StreamerSection />
            <GiftSection />
            <PromoSection />
            <VideoSection />
            <NewsSection />
            <AboutSection />
          </div>
        </div>
      </div>
    </main>
  );
}
