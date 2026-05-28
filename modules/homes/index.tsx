"use client";

import { useEffect, useState } from "react";
import type {
  HomeLiveCategoryCountsResponse,
  HomeLiveVideoItem,
} from "@/models/match";
import { getTodayEndISOString, getTodayStartISOString } from "@/helpers/string";
import { emptyHomeAssets, getHomeAssets, type HomeAssets } from "@/services/homeAssets";
import { defaultLiveRoomSettings, getLiveRoomSettings } from "@/services/liveRoomSettings";
import {
  getHomeHotLiveVideos,
  getHomeLiveCategoryCounts,
  getHomeLiveVideos,
} from "@/services/matches";
import { homeCategories, type HomeCategory } from "./components/homeData";
import OkwinHomeScreen from "./components/OkwinHomeScreen";

type HomeClientData = {
  categoryLiveVideos: Partial<Record<HomeCategory["id"], HomeLiveVideoItem[]>>;
  customerSupportUrl?: string;
  heroPanelLiveItems: HomeLiveVideoItem[];
  homeAssets: HomeAssets;
  homeLiveCategoryCounts: HomeLiveCategoryCountsResponse;
  hotLiveItems: HomeLiveVideoItem[];
};

const emptyHomeClientData: HomeClientData = {
  categoryLiveVideos: {},
  customerSupportUrl: defaultLiveRoomSettings.customerSupportUrl,
  heroPanelLiveItems: [],
  homeAssets: emptyHomeAssets,
  homeLiveCategoryCounts: {},
  hotLiveItems: [],
};

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeClientData>(emptyHomeClientData);

  useEffect(() => {
    let isActive = true;
    const liveDateRange = {
      startTimeFrom: getTodayStartISOString(),
      startTimeTo: getTodayEndISOString(),
    };

    async function loadHomeData() {
      try {
        const [
          homeAssets,
          hotLiveVideos,
          heroPanelLiveVideos,
          homeLiveCategoryCounts,
          categoryLiveVideos,
          liveRoomSettings,
        ] = await Promise.all([
          getHomeAssets(),
          getHomeHotLiveVideos({
            limit: 8,
            status: "live",
          }),
          getHomeHotLiveVideos({
            ...liveDateRange,
            limit: 4,
            status: "live",
          }),
          getHomeLiveCategoryCounts(),
          Promise.all(
            homeCategories.map(async (category) => {
              const response = await getHomeLiveVideos({
                categoryName: category.apiCategoryName,
                status: "not_finished",
              });

              return [category.id, response.items] as const;
            }),
          ).then((entries) => Object.fromEntries(entries)),
          getLiveRoomSettings(),
        ]);

        if (!isActive) {
          return;
        }

        setHomeData({
          categoryLiveVideos,
          customerSupportUrl: liveRoomSettings.customerSupportUrl,
          heroPanelLiveItems: heroPanelLiveVideos.items,
          homeAssets,
          homeLiveCategoryCounts,
          hotLiveItems: hotLiveVideos.items,
        });
      } catch (error) {
        console.error("home client request failed", error);
      }
    }

    void loadHomeData();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <OkwinHomeScreen
      categoryLiveVideos={homeData.categoryLiveVideos}
      customerSupportUrl={homeData.customerSupportUrl}
      heroPanelLiveItems={homeData.heroPanelLiveItems}
      homeAssets={homeData.homeAssets}
      homeLiveCategoryCounts={homeData.homeLiveCategoryCounts}
      hotLiveItems={homeData.hotLiveItems}
    />
  );
}
