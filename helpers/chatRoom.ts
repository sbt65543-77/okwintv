import type { HomeLiveChannelItem } from "@/models/match";

const normalizeChatRoomPart = (value?: string | number | null) => {
  const normalizedValue = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalizedValue || "default";
};

export const buildLiveChatRoomId = (
  channelId: string,
  live?: Partial<HomeLiveChannelItem> | null,
  fallbackIndex = 0,
) => {
  const liveRoomPart =
    live?.commentatorId || live?.roomName || live?.liveName || fallbackIndex;

  return `${normalizeChatRoomPart(channelId)}__blv__${normalizeChatRoomPart(liveRoomPart)}`;
};

