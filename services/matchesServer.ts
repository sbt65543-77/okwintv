import "server-only";
import { callApiProxy } from "@/server/callApiProxy";
import type {
  HomeLiveCategoryCountsResponse,
  HomeLiveVideoResponse,
  HomeLiveVideosResponse,
  LiveChannelStatus,
} from "@/models/match";

export interface HomeLiveVideosServerParams {
  categoryName?: string;
  hot?: boolean;
  limit?: number;
  page?: number;
  startTimeFrom?: string;
  startTimeTo?: string;
  status?: LiveChannelStatus | "all" | "not_finished";
}

const emptyHomeLiveVideosResponse: HomeLiveVideosResponse = {
  items: [],
  total: 0,
};

const emptyHomeLiveCategoryCountsResponse: HomeLiveCategoryCountsResponse = {};

const logHomeLiveVideosServerError = (
  endpoint: string,
  error: unknown,
  status?: number,
) => {
  console.error("home live videos SSR request failed", {
    endpoint,
    status,
    message: error instanceof Error ? error.message : String(error),
  });
};

export const getHomeLiveVideosServer = async (
  params?: HomeLiveVideosServerParams,
): Promise<HomeLiveVideosResponse> => {
  const endpoint = "/matches/home-live-videos";

  try {
    const response = await callApiProxy<Partial<HomeLiveVideosResponse>>({
      endpoint,
      method: "GET",
      params: params ? { ...params } : undefined,
    });

    if (!response.ok || !response.data) {
      logHomeLiveVideosServerError(
        endpoint,
        "Empty or non-ok response",
        response.status,
      );
      return emptyHomeLiveVideosResponse;
    }

    return {
      items: Array.isArray(response.data.items) ? response.data.items : [],
      total: Number(response.data.total) || 0,
    };
  } catch (error) {
    logHomeLiveVideosServerError(endpoint, error);
    return emptyHomeLiveVideosResponse;
  }
};

export const getHomeHotLiveVideosServer = async (
  params?: Omit<HomeLiveVideosServerParams, "hot">,
): Promise<HomeLiveVideosResponse> => {
  const endpoint = "/matches/home-hot-live-videos";

  try {
    const response = await callApiProxy<Partial<HomeLiveVideosResponse>>({
      endpoint,
      method: "GET",
      params: params ? { ...params } : undefined,
    });

    if (!response.ok || !response.data) {
      logHomeLiveVideosServerError(
        endpoint,
        "Empty or non-ok response",
        response.status,
      );
      return emptyHomeLiveVideosResponse;
    }

    return {
      items: Array.isArray(response.data.items) ? response.data.items : [],
      total: Number(response.data.total) || 0,
    };
  } catch (error) {
    logHomeLiveVideosServerError(endpoint, error);
    return emptyHomeLiveVideosResponse;
  }
};

export const getHomeLiveVideoServer = async (
  channelId?: string,
  roomName?: string,
  commentatorId?: string,
): Promise<HomeLiveVideoResponse | null> => {
  const endpoint = "/matches/home-live-video";

  try {
    const response = await callApiProxy<HomeLiveVideoResponse>({
      endpoint,
      method: "GET",
      params: channelId ? { channelId, roomName, commentatorId } : undefined,
    });

    if (!response.ok || !response.data) {
      logHomeLiveVideosServerError(
        endpoint,
        "Empty or non-ok response",
        response.status,
      );
      return null;
    }

    return response.data;
  } catch (error) {
    logHomeLiveVideosServerError(endpoint, error);
    return null;
  }
};

export const getHomeLiveCategoryCountsServer =
  async (): Promise<HomeLiveCategoryCountsResponse> => {
    const endpoint = "/matches/home-live-category-counts";

    try {
      const response = await callApiProxy<HomeLiveCategoryCountsResponse>({
        endpoint,
        method: "GET",
      });

      if (!response.ok || !response.data) {
        logHomeLiveVideosServerError(
          endpoint,
          "Empty or non-ok response",
          response.status,
        );
        return emptyHomeLiveCategoryCountsResponse;
      }

      return response.data;
    } catch (error) {
      logHomeLiveVideosServerError(endpoint, error);
      return emptyHomeLiveCategoryCountsResponse;
    }
  };
