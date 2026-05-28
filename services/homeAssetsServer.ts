import "server-only";
import { callApiProxy } from "@/server/callApiProxy";
import type { HomeAssets } from "./homeAssets";

const emptyHomeAssets: HomeAssets = {
  bannerImageUrls: [],
  bannerPcImageUrls: [],
  bannerMobileImageUrls: [],
  headerPromoImageUrl: "",
};

export const getHomeAssetsServer = async (): Promise<HomeAssets> => {
  const endpoint = "/home-assets";

  try {
    const response = await callApiProxy<Partial<HomeAssets>>({
      endpoint,
      method: "GET",
    });

    if (!response.ok || !response.data) {
      console.error("home assets SSR request failed", {
        endpoint,
        status: response.status,
        message: "Empty or non-ok response",
      });
      return emptyHomeAssets;
    }

    const legacyBannerImageUrls = Array.isArray(response.data.bannerImageUrls)
      ? response.data.bannerImageUrls
      : [];
    const bannerPcImageUrls = Array.isArray(response.data.bannerPcImageUrls)
      ? response.data.bannerPcImageUrls
      : legacyBannerImageUrls;
    const bannerMobileImageUrls = Array.isArray(response.data.bannerMobileImageUrls)
      ? response.data.bannerMobileImageUrls
      : legacyBannerImageUrls;

    return {
      bannerImageUrls: legacyBannerImageUrls,
      bannerPcImageUrls,
      bannerMobileImageUrls,
      headerPromoImageUrl:
        typeof response.data.headerPromoImageUrl === "string"
          ? response.data.headerPromoImageUrl
          : "",
    };
  } catch (error) {
    console.error("home assets SSR request failed", {
      endpoint,
      message: error instanceof Error ? error.message : String(error),
    });
    return emptyHomeAssets;
  }
};
