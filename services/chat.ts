import { Axios } from "./Axios";

export interface ChatTokenResponse {
  roomArn: string;
  region: string;
  token: string;
  sessionExpirationTime?: string;
  tokenExpirationTime?: string;
}

export interface ChatMessageItem {
  _id: string;
  channelId: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  role?: string;
  content: string;
  pinned?: boolean;
  pinnedAt?: string;
  pinnedBy?: string;
  createdAt?: string;
}

export const getChatMessages = async (
  channelId: string,
  options?: {
    limit?: number;
    page?: number;
  },
) => {
  const encodedChannelId = encodeURIComponent(channelId);
  const response = await Axios(false).get<ChatMessageItem[]>(`/chat/${encodedChannelId}/messages`, {
    params: {
      channelId,
      limit: options?.limit || 100,
      page: options?.page || 1,
    },
  });

  return response.data;
};

export const createChatMessage = async (channelId: string, content: string) => {
  const encodedChannelId = encodeURIComponent(channelId);
  const response = await Axios(true).post<ChatMessageItem>(`/chat/${encodedChannelId}/messages`, { content });

  return response.data;
};

export const getPinnedChatMessage = async (channelId: string) => {
  const encodedChannelId = encodeURIComponent(channelId);
  const response = await Axios(false).get<ChatMessageItem | null>(`/chat/${encodedChannelId}/pinned-message`);

  return response.data;
};

export const pinChatMessage = async (channelId: string, messageId: string) => {
  const encodedChannelId = encodeURIComponent(channelId);
  const encodedMessageId = encodeURIComponent(messageId);
  const response = await Axios(true).patch<ChatMessageItem>(`/chat/${encodedChannelId}/messages/${encodedMessageId}/pin`);

  return response.data;
};

export const unpinChatMessage = async (channelId: string) => {
  const encodedChannelId = encodeURIComponent(channelId);
  const response = await Axios(true).delete<{ ok: boolean }>(`/chat/${encodedChannelId}/pinned-message`);

  return response.data;
};

export const getChatToken = async (channelId: string) => {
  const response = await Axios(true).post<ChatTokenResponse>("/chat/token", { channelId });

  return response.data;
};

export const getGuestChatToken = async (channelId: string) => {
  const response = await Axios(false).post<ChatTokenResponse>("/chat/guest-token", { channelId });

  return response.data;
};

export const deleteChatMessage = async (
  channelId: string,
  messageId: string,
  reason = "Deleted by moderator",
) => {
  const encodedChannelId = encodeURIComponent(channelId);
  const encodedMessageId = encodeURIComponent(messageId);
  const response = await Axios(true).delete(`/chat/${encodedChannelId}/messages/${encodedMessageId}`, {
    data: { reason },
  });

  return response.data;
};
