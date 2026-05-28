import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChatRoom, SendMessageRequest } from "amazon-ivs-chat-messaging";
import { getAuthLocalData, tokenChecker } from "@/helpers/token";
import {
  type ChatMessageItem,
  createChatMessage,
  getChatMessages,
  getGuestChatToken,
  getPinnedChatMessage,
  getChatToken,
  pinChatMessage,
  unpinChatMessage,
} from "@/services/chat";

export type ChatLine = {
  id: string;
  content: string;
  sender: string;
  avatarUrl?: string;
  channelId?: string;
  isPinned?: boolean;
  role?: string;
};

const CHAT_MESSAGE_PAGE_SIZE = 100;
export const ADMIN_INFO_COMMAND = "@GUITHONGTINCHOKHACHHANG";
const ADMIN_INFO_CARD_INTERVAL_MS = 5 * 60 * 1000;

export const ownerChatCommands = [
  {
    label: ADMIN_INFO_COMMAND,
    description: "Gửi form thông tin admin cho khách hàng",
    value: ADMIN_INFO_COMMAND,
  },
];

const mapChatMessageItemToLine = (item: ChatMessageItem): ChatLine => ({
  id: item._id,
  content: item.content,
  sender: item.displayName || "User",
  avatarUrl: item.avatarUrl,
  channelId: item.channelId,
  isPinned: item.pinned,
  role: item.role,
});

const createAdminInfoCardMessage = (channelId: string): ChatLine => ({
  id: `admin-info-card:${channelId}:${Date.now()}`,
  content: ADMIN_INFO_COMMAND,
  sender: "admin",
  role: "admin",
});

const authSubscribe = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("auth:changed", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("auth:changed", onStoreChange);
  };
};

const getAuthSnapshot = () => {
  const authData = getAuthLocalData();

  return tokenChecker(authData) ? JSON.stringify(authData) : "";
};

const getServerAuthSnapshot = () => "";

const saveChatCooldown = (channelId: string) => {
  if (typeof window === "undefined") {
    return 0;
  }

  return 0;
};

function parseChatAuthSnapshot(snapshot: string) {
  if (!snapshot) {
    return null;
  }

  try {
    return JSON.parse(snapshot) as { user?: { role?: string } };
  } catch {
    return null;
  }
}

export function useLiveChat({
  channelId,
  initialMessages,
}: {
  channelId: string;
  initialMessages?: ChatMessageItem[];
}) {
  const safeInitialMessages = initialMessages || [];
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatLine[]>(() =>
    safeInitialMessages.map(mapChatMessageItemToLine),
  );
  const [pinnedMessage, setPinnedMessage] = useState<ChatLine | null>(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOwnerCommandPopupOpen, setIsOwnerCommandPopupOpen] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(
    safeInitialMessages.length === CHAT_MESSAGE_PAGE_SIZE,
  );
  const [selectedOwnerCommandIndex, setSelectedOwnerCommandIndex] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const roomRef = useRef<ChatRoom | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToInitialBottomRef = useRef(false);
  const shouldScrollToBottomAfterMessageRef = useRef(false);
  const isLoadingOlderMessagesRef = useRef(false);
  const latestMessagesRefreshTimeoutRef = useRef<number | null>(null);
  const nextChatHistoryPageRef = useRef(2);
  const pendingOlderMessagesScrollRef = useRef<{
    previousScrollHeight: number;
    previousScrollTop: number;
  } | null>(null);
  const authSnapshot = useSyncExternalStore(
    authSubscribe,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const canChat = Boolean(authSnapshot);
  const authData = parseChatAuthSnapshot(authSnapshot);
  const userRole = String(authData?.user?.role || "").toUpperCase();
  const canUseOwnerCommands = userRole === "OWNER";
  const canPinMessages = ["ADMIN", "OWNER", "BLV", "STREAMER"].includes(
    userRole,
  );
  const shouldShowOwnerCommands =
    canUseOwnerCommands &&
    isOwnerCommandPopupOpen &&
    input.trim().startsWith("@");
  const filteredOwnerCommands = shouldShowOwnerCommands
    ? ownerChatCommands.filter((command) =>
        command.value.toLowerCase().startsWith(input.trim().toLowerCase()),
      )
    : [];

  const requestLoginForChat = useCallback(() => {
    if (!canChat) {
      setIsAuthOpen(true);
    }
  }, [canChat]);

  const selectOwnerCommand = useCallback((command: string) => {
    setInput(command);
    setIsOwnerCommandPopupOpen(false);
    setSelectedOwnerCommandIndex(0);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const scrollChatToBottomOnNextFrame = useCallback(() => {
    window.requestAnimationFrame(() => {
      const scrollElement = chatScrollRef.current;

      if (!scrollElement) {
        return;
      }

      scrollElement.scrollTo({
        behavior: "smooth",
        top: scrollElement.scrollHeight,
      });
      setShowScrollToBottom(false);
    });
  }, []);

  const scrollChatToBottomImmediately = useCallback(() => {
    const scrollElement = chatScrollRef.current;

    if (!scrollElement) {
      return false;
    }

    scrollElement.scrollTop = scrollElement.scrollHeight;
    setShowScrollToBottom(false);
    return true;
  }, []);

  const isChatScrolledNearBottom = useCallback(() => {
    const scrollElement = chatScrollRef.current;

    if (!scrollElement) {
      return true;
    }

    const distanceToBottom =
      scrollElement.scrollHeight -
      scrollElement.scrollTop -
      scrollElement.clientHeight;

    return distanceToBottom <= 80;
  }, []);

  const refreshLatestMessages = useCallback(() => {
    if (latestMessagesRefreshTimeoutRef.current) {
      window.clearTimeout(latestMessagesRefreshTimeoutRef.current);
    }

    latestMessagesRefreshTimeoutRef.current = window.setTimeout(() => {
      getChatMessages(channelId, {
        limit: CHAT_MESSAGE_PAGE_SIZE,
        page: 1,
      })
        .then((items) => {
          setHasOlderMessages(items.length === CHAT_MESSAGE_PAGE_SIZE);
          setMessages(items.map(mapChatMessageItemToLine));
        })
        .catch(() => undefined);
    }, 500);
  }, [channelId]);

  useEffect(() => {
    let isActive = true;

    hasScrolledToInitialBottomRef.current = false;
    shouldScrollToBottomAfterMessageRef.current = false;
    isLoadingOlderMessagesRef.current = false;
    nextChatHistoryPageRef.current = 2;
    pendingOlderMessagesScrollRef.current = null;
    shouldScrollToBottomAfterMessageRef.current = true;
    setHasOlderMessages(safeInitialMessages.length === CHAT_MESSAGE_PAGE_SIZE);
    setMessages(safeInitialMessages.map(mapChatMessageItemToLine));

    if (initialMessages === undefined) {
      getChatMessages(channelId, {
        limit: CHAT_MESSAGE_PAGE_SIZE,
        page: 1,
      })
        .then((items) => {
          if (!isActive) {
            return;
          }

          setHasOlderMessages(items.length === CHAT_MESSAGE_PAGE_SIZE);
          hasScrolledToInitialBottomRef.current = false;
          shouldScrollToBottomAfterMessageRef.current = true;
          setMessages(items.map(mapChatMessageItemToLine));
        })
        .catch(() => undefined);
    }

    getPinnedChatMessage(channelId)
      .then((item) => {
        if (!isActive) {
          return;
        }

        setPinnedMessage(item ? mapChatMessageItemToLine(item) : null);
      })
      .catch(() => {
        if (isActive) {
          setPinnedMessage(null);
        }
      });

    return () => {
      isActive = false;
      if (latestMessagesRefreshTimeoutRef.current) {
        window.clearTimeout(latestMessagesRefreshTimeoutRef.current);
        latestMessagesRefreshTimeoutRef.current = null;
      }
    };
  }, [channelId, initialMessages]);

  useEffect(() => {
    let isActive = true;
    const room = new ChatRoom({
      regionOrUrl: process.env.NEXT_PUBLIC_AWS_REGION || "ap-northeast-2",
      tokenProvider: async () => {
        const token = canChat
          ? await getChatToken(channelId)
          : await getGuestChatToken(channelId);
        return {
          token: token.token,
          sessionExpirationTime: token.sessionExpirationTime
            ? new Date(token.sessionExpirationTime)
            : undefined,
          tokenExpirationTime: token.tokenExpirationTime
            ? new Date(token.tokenExpirationTime)
            : undefined,
        };
      },
    });
    roomRef.current = room;

    const unsubscribers = [
      room.addListener("connecting", () => setConnectionState("connecting")),
      room.addListener("connect", () => setConnectionState("connected")),
      room.addListener("disconnect", () => setConnectionState("disconnected")),
      room.addListener(
        "message",
        (message: {
          id: string;
          content: string;
          sender?: {
            attributes?: Record<string, string>;
            userId?: string;
          };
        }) => {
          if (!isActive) {
            return;
          }
          shouldScrollToBottomAfterMessageRef.current =
            isChatScrolledNearBottom();
          setMessages((current) => [
            ...current,
            {
              id: message.id,
              content: message.content,
              sender:
                message.sender?.attributes?.displayName ||
                message.sender?.userId ||
                "User",
              avatarUrl: message.sender?.attributes?.avatarUrl,
              channelId,
              role: message.sender?.attributes?.role,
            },
          ]);
          refreshLatestMessages();
        },
      ),
      room.addListener(
        "messageDelete",
        (event: { messageId?: string; id?: string }) => {
          const deletedId = event.messageId || event.id;
          setMessages((current) =>
            current.filter((message) => message.id !== deletedId),
          );
        },
      ),
    ];

    room.connect();

    return () => {
      isActive = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      room.disconnect();
      roomRef.current = null;
    };
  }, [canChat, channelId, isChatScrolledNearBottom, refreshLatestMessages]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      shouldScrollToBottomAfterMessageRef.current = isChatScrolledNearBottom();
      setMessages((current) => [
        ...current,
        createAdminInfoCardMessage(channelId),
      ]);
    }, ADMIN_INFO_CARD_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [channelId, isChatScrolledNearBottom]);

  const sendMessage = useCallback(
    async (contentOverride?: string) => {
      const content = (contentOverride ?? input).trim();
      if (!content || !canChat || isSending) {
        return;
      }

      setIsSending(true);
      try {
        if (roomRef.current && connectionState === "connected") {
          await roomRef.current.sendMessage(new SendMessageRequest(content));
          await createChatMessage(channelId, content);
          if (!contentOverride) {
            setInput((currentInput) =>
              currentInput.trim() === content ? "" : currentInput,
            );
          }
          saveChatCooldown(channelId);
          scrollChatToBottomOnNextFrame();
          return;
        }

        const savedMessage = await createChatMessage(channelId, content);
        setMessages((current) => [
          ...current,
          {
            id: savedMessage._id,
            content: savedMessage.content,
            sender: savedMessage.displayName || "User",
            avatarUrl: savedMessage.avatarUrl,
            channelId: savedMessage.channelId,
            isPinned: savedMessage.pinned,
            role: savedMessage.role,
          },
        ]);
        if (!contentOverride) {
          setInput((currentInput) =>
            currentInput.trim() === content ? "" : currentInput,
          );
        }
        saveChatCooldown(channelId);
        scrollChatToBottomOnNextFrame();
      } catch {
      } finally {
        setIsSending(false);
      }
    },
    [
      canChat,
      channelId,
      connectionState,
      input,
      isSending,
      scrollChatToBottomOnNextFrame,
    ],
  );

  const pinMessage = useCallback(
    async (message: ChatLine) => {
      if (!canPinMessages || message.id.startsWith("admin-info-card:")) {
        return;
      }

      try {
        const pinned = await pinChatMessage(channelId, message.id);
        setPinnedMessage(mapChatMessageItemToLine(pinned));
        setMessages((current) =>
          current.map((currentMessage) => ({
            ...currentMessage,
            isPinned: currentMessage.id === pinned._id,
          })),
        );
      } catch {
      }
    },
    [canPinMessages, channelId],
  );

  const unpinMessage = useCallback(async () => {
    if (!canPinMessages) {
      return;
    }

    try {
      await unpinChatMessage(channelId);
      setPinnedMessage(null);
      setMessages((current) =>
        current.map((message) => ({ ...message, isPinned: false })),
      );
    } catch {
    }
  }, [canPinMessages, channelId]);

  const insertEmojiText = useCallback((text: string) => {
    setInput((currentInput) => {
      const inputElement = inputRef.current;
      const selectionStart =
        inputElement?.selectionStart ?? currentInput.length;
      const selectionEnd = inputElement?.selectionEnd ?? currentInput.length;
      const beforeSelection = currentInput.slice(0, selectionStart);
      const afterSelection = currentInput.slice(selectionEnd);
      const prefix =
        beforeSelection && !beforeSelection.endsWith(" ") ? " " : "";
      const suffix =
        afterSelection && !afterSelection.startsWith(" ") ? " " : "";

      return `${beforeSelection}${prefix}${text}${suffix}${afterSelection}`;
    });
    setIsEmojiPickerOpen(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const loadOlderMessages = useCallback(async () => {
    if (
      isLoadingOlderMessagesRef.current ||
      isLoadingOlderMessages ||
      !hasOlderMessages ||
      !messages.length
    ) {
      return;
    }

    const scrollElement = chatScrollRef.current;

    if (!scrollElement) {
      return;
    }

    isLoadingOlderMessagesRef.current = true;
    setIsLoadingOlderMessages(true);
    try {
      const olderMessages = await getChatMessages(channelId, {
        limit: CHAT_MESSAGE_PAGE_SIZE,
        page: nextChatHistoryPageRef.current,
      });

      setHasOlderMessages(olderMessages.length === CHAT_MESSAGE_PAGE_SIZE);
      if (!olderMessages.length) {
        return;
      }

      pendingOlderMessagesScrollRef.current = {
        previousScrollHeight: scrollElement.scrollHeight,
        previousScrollTop: scrollElement.scrollTop,
      };
      shouldScrollToBottomAfterMessageRef.current = false;
      nextChatHistoryPageRef.current += 1;
      setMessages((current) => [
        ...olderMessages.map(mapChatMessageItemToLine),
        ...current,
      ]);
    } catch {
    } finally {
      isLoadingOlderMessagesRef.current = false;
      setIsLoadingOlderMessages(false);
    }
  }, [channelId, hasOlderMessages, isLoadingOlderMessages, messages.length]);

  const updateScrollToBottomVisibility = useCallback(() => {
    const scrollElement = chatScrollRef.current;

    if (!scrollElement) {
      return;
    }

    const distanceToBottom =
      scrollElement.scrollHeight -
      scrollElement.scrollTop -
      scrollElement.clientHeight;

    setShowScrollToBottom(distanceToBottom > 80);
  }, []);

  const handleChatScroll = useCallback(() => {
    updateScrollToBottomVisibility();

    const scrollElement = chatScrollRef.current;
    if (scrollElement && scrollElement.scrollTop <= 80) {
      void loadOlderMessages();
    }
  }, [loadOlderMessages, updateScrollToBottomVisibility]);

  const scrollChatToBottom = useCallback(() => {
    const scrollElement = chatScrollRef.current;

    if (!scrollElement) {
      return;
    }

    scrollElement.scrollTo({
      behavior: "smooth",
      top: scrollElement.scrollHeight,
    });
    setShowScrollToBottom(false);
  }, []);

  const renderedMessages = messages.length ? messages : [];
  const lastRenderedMessageId =
    renderedMessages[renderedMessages.length - 1]?.id || "";

  useLayoutEffect(() => {
    const pendingScroll = pendingOlderMessagesScrollRef.current;
    const scrollElement = chatScrollRef.current;

    if (!pendingScroll || !scrollElement) {
      return;
    }

    scrollElement.scrollTop =
      scrollElement.scrollHeight -
      pendingScroll.previousScrollHeight +
      pendingScroll.previousScrollTop;
    pendingOlderMessagesScrollRef.current = null;
    setShowScrollToBottom(false);
  }, [messages.length]);

  useEffect(() => {
    if (pendingOlderMessagesScrollRef.current) {
      return;
    }

    if (!hasScrolledToInitialBottomRef.current) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (scrollChatToBottomImmediately()) {
            hasScrolledToInitialBottomRef.current = true;
            shouldScrollToBottomAfterMessageRef.current = false;
          }
        });
      });
      return;
    }

    if (shouldScrollToBottomAfterMessageRef.current) {
      window.requestAnimationFrame(() => {
        scrollChatToBottomImmediately();
        shouldScrollToBottomAfterMessageRef.current = false;
      });
      return;
    }

    window.requestAnimationFrame(updateScrollToBottomVisibility);
  }, [
    lastRenderedMessageId,
    renderedMessages.length,
    scrollChatToBottomImmediately,
    updateScrollToBottomVisibility,
  ]);

  return {
    canChat,
    canPinMessages,
    chatScrollRef,
    filteredOwnerCommands,
    handleChatScroll,
    input,
    inputRef,
    insertEmojiText,
    isAuthOpen,
    isEmojiPickerOpen,
    isLoadingOlderMessages,
    isSending,
    pinMessage,
    pinnedMessage,
    renderedMessages,
    requestLoginForChat,
    scrollChatToBottom,
    selectOwnerCommand,
    selectedOwnerCommandIndex,
    sendMessage,
    setInput,
    setIsAuthOpen,
    setIsEmojiPickerOpen,
    setIsOwnerCommandPopupOpen,
    setSelectedOwnerCommandIndex,
    showScrollToBottom,
    unpinMessage,
  };
}
