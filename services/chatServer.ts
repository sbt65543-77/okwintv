import "server-only";
import { callApiProxy } from "@/server/callApiProxy";
import type { ChatMessageItem } from "./chat";

export const getChatMessagesServer = async (
  channelId: string,
  options?: {
    limit?: number;
    page?: number;
  },
): Promise<ChatMessageItem[]> => {
  const endpoint = `/chat/${channelId}/messages`;

  try {
    const response = await callApiProxy<ChatMessageItem[]>({
      endpoint,
      method: "GET",
      params: {
        channelId,
        limit: options?.limit || 100,
        page: options?.page || 1,
      },
    });

    if (!response.ok || !Array.isArray(response.data)) {
      console.error("chat messages SSR request failed", {
        endpoint,
        status: response.status,
        message: "Empty or non-ok response",
      });
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("chat messages SSR request failed", {
      endpoint,
      message: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
};
