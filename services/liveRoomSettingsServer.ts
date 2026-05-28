import "server-only";
import { callApiProxy } from "@/server/callApiProxy";
import {
  defaultLiveRoomSettings,
  type LiveRoomSettings,
} from "./liveRoomSettings";

export const getLiveRoomSettingsServer = async (): Promise<LiveRoomSettings> => {
  const endpoint = "/live-room-settings";

  try {
    const response = await callApiProxy<Partial<LiveRoomSettings>>({
      endpoint,
      method: "GET",
    });

    if (!response.ok || !response.data) {
      console.error("live room settings SSR request failed", {
        endpoint,
        status: response.status,
        message: "Empty or non-ok response",
      });
      return defaultLiveRoomSettings;
    }

    return {
      ...defaultLiveRoomSettings,
      ...response.data,
    };
  } catch (error) {
    console.error("live room settings SSR request failed", {
      endpoint,
      message: error instanceof Error ? error.message : String(error),
    });
    return defaultLiveRoomSettings;
  }
};
