import env from "@/configs/env";
import { Axios } from "./Axios";

export interface HomeAssets {
  bannerImageUrls: string[];
  bannerPcImageUrls: string[];
  bannerMobileImageUrls: string[];
  headerPromoImageUrl: string;
}

export const emptyHomeAssets: HomeAssets = {
  bannerImageUrls: [],
  bannerPcImageUrls: [],
  bannerMobileImageUrls: [],
  headerPromoImageUrl: "",
};

export const getHomeAssets = async (): Promise<HomeAssets> => {
  const response = await Axios(false).get<Partial<HomeAssets>>("/home-assets");
  const data = response.data || {};
  const legacyBannerImageUrls = Array.isArray(data.bannerImageUrls)
    ? data.bannerImageUrls
    : [];
  const bannerPcImageUrls = Array.isArray(data.bannerPcImageUrls)
    ? data.bannerPcImageUrls
    : legacyBannerImageUrls;
  const bannerMobileImageUrls = Array.isArray(data.bannerMobileImageUrls)
    ? data.bannerMobileImageUrls
    : legacyBannerImageUrls;

  return {
    bannerImageUrls: legacyBannerImageUrls,
    bannerPcImageUrls,
    bannerMobileImageUrls,
    headerPromoImageUrl:
      typeof data.headerPromoImageUrl === "string"
        ? data.headerPromoImageUrl
        : "",
  };
};

export const getAssetImageUrl = (url?: string) => {
  if (!url) {
    return "";
  }

  if (url.startsWith("http")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${getImageBaseUrl()}${url}`;
  }

  if (url.startsWith("/")) {
    return url;
  }

  return `${getImageBaseUrl()}/${url}`;
};

const getImageBaseUrl = () => {
  const baseUrl = env.apiEndPoint.trim();

  if (!baseUrl) {
    return "";
  }

  const normalizedBaseUrl = baseUrl.startsWith("http")
    ? baseUrl
    : `https://${baseUrl}`;

  return normalizedBaseUrl.replace(/\/+$/, "");
};
