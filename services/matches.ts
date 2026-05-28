import type {
  HomeLiveCategoryCountsResponse,
  HomeLiveVideosResponse,
  HomeLiveVideoResponse,
  LiveChannelStatus,
  LiveMatch,
  TodayMatchesResponse,
} from "@/models/match";
import { Axios } from "./Axios";

export interface MatchesByDateRangeParams {
  startTimeFrom: string;
  startTimeTo: string;
  categoryName?: string;
  status?: LiveChannelStatus;
  hot?: boolean;
  limit?: number;
}

export const getMatchesByDateRange = async (
  params: MatchesByDateRangeParams,
): Promise<TodayMatchesResponse> => {
  const response = await Axios(false).get<LiveMatch[] | TodayMatchesResponse>("/matches", {
    params,
  });
  const items = Array.isArray(response.data) ? response.data : response.data.items;

  return {
    items: items || [],
    total: Array.isArray(response.data) ? response.data.length : response.data.total || items?.length || 0,
  };
};

export const getTodayMatches = getMatchesByDateRange;

export const getHomeLiveVideo = async (
  channelId?: string,
  roomName?: string,
  commentatorId?: string,
): Promise<HomeLiveVideoResponse> => {
  const response = await Axios(false).get<HomeLiveVideoResponse>("/matches/home-live-video", {
    params: channelId ? { channelId, roomName, commentatorId } : undefined,
  });

  return response.data;
};

export const getHomeLiveVideos = async (params?: {
  categoryName?: string;
  hot?: boolean;
  limit?: number;
  page?: number;
  startTimeFrom?: string;
  startTimeTo?: string;
  status?: LiveChannelStatus | "all" | "not_finished";
}): Promise<HomeLiveVideosResponse> => {
  const response = await Axios(false).get<HomeLiveVideosResponse>("/matches/home-live-videos", {
    params,
  });

  return response.data;
};

export const getHomeHotLiveVideos = async (params?: {
  limit?: number;
  startTimeFrom?: string;
  startTimeTo?: string;
  status?: LiveChannelStatus;
}): Promise<HomeLiveVideosResponse> => {
    const response = await Axios(false).get<HomeLiveVideosResponse>("/matches/home-hot-live-videos", {
      params,
    });

    return response.data;
};

export const getHomeLiveCategoryCounts =
  async (): Promise<HomeLiveCategoryCountsResponse> => {
    const response = await Axios(false).get<HomeLiveCategoryCountsResponse>("/matches/home-live-category-counts");

    return response.data;
  };
