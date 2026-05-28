export interface LiveMatchQuality {
  quality: string;
  channelId?: string;
  channelTitle?: string;
  channelRoomName?: string;
  channelLiveName?: string;
  url: string;
}

export interface LiveMatchLink {
  commentatorId: string;
  commentatorName?: string;
  qualities: LiveMatchQuality[];
}

export interface LiveMatchChannel {
  channelId: string;
  channelTitle?: string;
  channelRoomName?: string;
  channelLiveName?: string;
  url?: string;
}

export interface LiveMatch {
  _id: string;
  title: string;
  tournament?: string;
  tournamentId?: string;
  tournamentLogoUrl?: string;
  type?: string;
  externalSource?: string;
  externalId?: string;
  categoryName?: string;
  categoryNames?: string[];
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeamImageUrl?: string;
  awayTeamImageUrl?: string;
  liveBackgroundImageUrl?: string;
  startTime: string;
  endTime?: string;
  venue?: string;
  score: string;
  status: "scheduled" | "live" | "finished" | "cancelled";
  description?: string;
  liveChannels?: LiveMatchChannel[];
  liveLinks: LiveMatchLink[];
  createdAt?: string;
  updatedAt?: string;
}

export type LiveChannelStatus = "scheduled" | "live" | "finished" | "cancelled";

export type TodayMatch = LiveMatch & {
  channelId?: string;
  channelStatus?: LiveChannelStatus;
};

export interface TodayMatchesResponse {
  items: TodayMatch[];
  total: number;
}

export interface HomeLiveChannelItem {
  roomName: string;
  liveName: string;
  commentatorId?: string;
  commentatorAvatarUrl?: string;
  commentatorName?: string;
  liveStatus?: "live" | "offline";
  videoUrl?: string | null;
  authorizedPlaybackUrl?: string | null;
  token?: string;
  expiresAt?: number;
}

export interface HomeLiveVideoResponse {
  match: LiveMatch | null;
  channel: {
    _id: string;
    title: string;
    matchId?: string;
    isLink?: boolean;
    status?: LiveChannelStatus;
    displayOrder?: number;
    viewerCount?: number;
    streamStartTime?: string;
    commentatorAvatarUrls?: string[];
    commentatorNames?: string[];
    live: HomeLiveChannelItem;
    lives?: HomeLiveChannelItem[];
  } | null;
  videoUrl: string | null;
  authorizedPlaybackUrl: string | null;
  token: string | null;
  expiresAt: number | null;
  liveBackgroundImageUrl?: string;
}

export interface HomeLiveVideoItem {
  id: string;
  match: LiveMatch;
  liveBackgroundImageUrl?: string;
  channel: {
    _id: string;
    title: string;
    matchId?: string;
    isLink?: boolean;
    status?: LiveChannelStatus;
    displayOrder?: number;
    viewerCount?: number;
    streamStartTime?: string;
    commentatorAvatarUrls?: string[];
    commentatorNames?: string[];
    live: HomeLiveChannelItem;
    lives?: HomeLiveChannelItem[];
  };
  videoUrl: string | null;
  authorizedPlaybackUrl: string | null;
  token: string;
  expiresAt: number;
}

export interface HomeLiveVideosResponse {
  items: HomeLiveVideoItem[];
  limit?: number;
  page?: number;
  total: number;
  totalPages?: number;
}

export type HomeLiveCategoryCountsResponse = Record<string, number>;
