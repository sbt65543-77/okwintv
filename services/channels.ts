import { Axios } from "./Axios";

export type BroadcastStatus = "scheduled" | "live" | "finished" | "cancelled";

export interface BroadcastLiveItem {
  roomName: string;
  liveName: string;
  commentatorId?: string;
  commentatorName?: string;
  ivsIngestEndpoint?: string;
  ivsPlaybackUrl?: string;
  playbackUrl?: string;
  ivsStreamKeyValue?: string;
  streamKey?: string;
  liveStatus?: "live" | "offline";
  viewerCount?: number;
  streamStartTime?: string;
}

export interface BroadcastRoom {
  _id: string;
  title: string;
  matchId?: string;
  matchStartTime?: string;
  matchTournament?: string;
  type?: string;
  status?: BroadcastStatus;
  isLink?: boolean;
  channels: BroadcastLiveItem[];
  liveStatus?: "live" | "offline";
  viewerCount?: number;
  createdAt?: string;
}

export interface BroadcastRoomsResponse {
  items: BroadcastRoom[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getMyBroadcastRooms = async (params?: {
  page?: number;
  limit?: number;
  status?: BroadcastStatus | BroadcastStatus[];
}) => {
  const response = await Axios(true).get<BroadcastRoomsResponse>("/channels/my-broadcasts", {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 100,
      status: Array.isArray(params?.status)
        ? params?.status.join(",")
        : params?.status,
    },
  });

  return response.data;
};

export const startBroadcastRoom = async (id: string) => {
  const response = await Axios(true).patch<BroadcastRoom>(`/channels/${id}/start-live`);

  return response.data;
};

export const stopBroadcastRoom = async (id: string) => {
  const response = await Axios(true).patch<BroadcastRoom>(`/channels/${id}/stop-live`);

  return response.data;
};
