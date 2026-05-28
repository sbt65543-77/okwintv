import Lottie from "lottie-react";
import type { ReactNode } from "react";
import Image from "next/image";
import AuthModal from "@/components/auth/AuthModal";
import { getAssetImageUrl } from "@/services/homeAssets";
import type { ChatMessageItem } from "@/services/chat";
import type { LiveRoomSettings } from "@/services/liveRoomSettings";
import {
  ADMIN_INFO_COMMAND,
  type ChatLine,
  useLiveChat,
} from "../hooks/useLiveChat";
import {
  chatEmojiOptions,
  chatPanelAssets,
  chatUnicodeEmojiOptions,
} from "./liveDetailAssets";
import fireAnimation from "../../../public/assets/detail_live/chats/animations/Fire.json";

export default function LiveChatPanel({
  chatPanelHeight,
  channelId,
  initialMessages,
  liveRoomSettings,
}: {
  chatPanelHeight?: number;
  channelId: string;
  initialMessages?: ChatMessageItem[];
  liveRoomSettings: LiveRoomSettings;
}) {
  const chat = useLiveChat({ channelId, initialMessages });

  return (
    <>
      <aside
        className="flex h-[620px] overflow-hidden rounded-[5px] bg-[#282828] shadow-[0_1px_4px_rgba(0,0,0,.25)] sm:h-[700px] lg:sticky lg:top-[75px]"
        style={chatPanelHeight ? { height: `${chatPanelHeight}px` } : undefined}
      >
        <div className="flex min-h-0 w-full flex-col">
          <div className="relative h-[41px] shrink-0 bg-[linear-gradient(180deg,#fd8901_0%,#ffa54e_100%)] text-[16px] font-medium text-white">
            <span className="absolute left-[26px] top-[32px] h-[2px] w-[65px] rounded-[5px] bg-white" />
            <button
              type="button"
              aria-pressed="true"
              className="absolute left-[26px] top-[9px] flex h-[20px] w-[64px] items-center gap-[6px]"
            >
              <Image src={chatPanelAssets.chat} alt="" width={20} height={20} aria-hidden />
              <span>Chat</span>
            </button>
            <button
              type="button"
              className="absolute left-[145px] top-[9px] flex h-[20px] w-[64px] items-center gap-[6px]"
            >
              <Image src={chatPanelAssets.bxh} alt="" width={20} height={20} aria-hidden />
              <span>BXH</span>
            </button>
            <div className="absolute left-[256px] top-[9px] flex items-start gap-[13px]">
              <SocialIconLink href={liveRoomSettings.facebookUrl} label="Facebook">
                <Image src={chatPanelAssets.facebook} alt="" width={23} height={23} aria-hidden />
              </SocialIconLink>
              <SocialIconLink href={liveRoomSettings.tiktokUrl} label="TikTok">
                <Image src={chatPanelAssets.tiktok} alt="" width={21} height={23} aria-hidden />
              </SocialIconLink>
              <SocialIconLink href={liveRoomSettings.telegramUrl} label="Telegram">
                <Image
                  src={chatPanelAssets.plane}
                  alt=""
                  width={24}
                  height={20}
                  className="mt-[1px]"
                  aria-hidden
                />
              </SocialIconLink>
            </div>
          </div>
          <ChatBanner liveRoomSettings={liveRoomSettings} />
          {chat.pinnedMessage ? (
            <PinnedChatMessage
              canUnpin={chat.canPinMessages}
              liveRoomSettings={liveRoomSettings}
              message={chat.pinnedMessage}
              onUnpin={chat.unpinMessage}
            />
          ) : null}
          <div className="relative min-h-0 flex-1">
            <div
              ref={chat.chatScrollRef}
              onScroll={chat.handleChatScroll}
              className="chat-panel-scroll h-full overflow-y-auto px-[10px] pb-[16px] pt-[18px] text-[12px] leading-[20px] text-white"
            >
              <AdminNoticeCard liveRoomSettings={liveRoomSettings} />
              {chat.isLoadingOlderMessages ? (
                <div className="pb-[10px] text-center text-[12px] font-medium text-white/60">
                  Đang tải thêm...
                </div>
              ) : null}
              {chat.renderedMessages.map((message) => (
                <ChatMessageLine
                  key={message.id}
                  canPin={chat.canPinMessages}
                  message={message}
                  liveRoomSettings={liveRoomSettings}
                  onPin={chat.pinMessage}
                />
              ))}
            </div>
            {chat.showScrollToBottom ? (
              <button
                type="button"
                aria-label="Cuộn xuống cuối chat"
                onClick={chat.scrollChatToBottom}
                className="absolute bottom-[12px] right-[18px] z-20 flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-[#f68c1f] bg-[#282828] text-[20px] font-bold leading-none text-[#f68c1f] shadow-[0_4px_12px_rgba(0,0,0,.35)]"
              >
                ↓
              </button>
            ) : null}
          </div>
          <div className="relative shrink-0 border-t-[2px] border-[#f68c1f] px-[5px] pb-[8px] pt-[8px]">
            {chat.isEmojiPickerOpen ? (
              <div className="absolute bottom-[105px] left-[5px] right-[5px] z-30 grid grid-cols-8 gap-[4px] rounded-[8px] border border-[#f68c1f] bg-[#343434] p-[8px] shadow-[0_6px_18px_rgba(0,0,0,.35)] sm:bottom-[123px] 2xl:right-auto 2xl:w-[350px]">
                {chatUnicodeEmojiOptions.map((emoji) => (
                  <button
                    key={emoji.label}
                    type="button"
                    aria-label={emoji.label}
                    disabled={!chat.canChat}
                    onClick={() => chat.insertEmojiText(emoji.value)}
                    className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[6px] text-[24px] leading-none transition hover:bg-[#f68c1f]/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span role="img" aria-label={emoji.label}>
                      {emoji.value}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mb-[8px] flex h-[54px] items-center justify-between sm:h-[65px]">
              {chatEmojiOptions.map((emoji) => (
                <button
                  key={emoji.token}
                  type="button"
                  aria-label={emoji.label}
                  disabled={!chat.canChat || chat.isSending}
                  onClick={() => chat.sendMessage(emoji.token)}
                  className="relative flex h-[54px] w-[54px] cursor-pointer items-center justify-center overflow-hidden rounded-[6px] border border-transparent transition hover:border-[#ff8c13] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[65px] sm:w-[65px]"
                >
                  <Image
                    src={emoji.src}
                    alt=""
                    width={65}
                    height={65}
                    className="h-full w-full object-contain"
                    aria-hidden
                  />
                </button>
              ))}
            </div>
            <div className="flex h-[34px] gap-[6px]">
              <div
                className="relative flex h-full min-w-0 flex-1 items-center gap-[8px] rounded-[5px] bg-[#171616] pl-[8px] pr-[10px]"
                onClick={chat.requestLoginForChat}
              >
                {chat.filteredOwnerCommands.length ? (
                  <div className="absolute bottom-[42px] left-0 right-0 z-40 overflow-hidden rounded-[8px] border border-[#f68c1f] bg-[#262626] shadow-[0_8px_20px_rgba(0,0,0,.45)]">
                    {chat.filteredOwnerCommands.map((command, index) => (
                      <button
                        key={command.value}
                        type="button"
                        aria-selected={index === chat.selectedOwnerCommandIndex}
                        className={`block w-full cursor-pointer px-[10px] py-[8px] text-left ${
                          index === chat.selectedOwnerCommandIndex
                            ? "bg-[#f68c1f]/30"
                            : "hover:bg-[#f68c1f]/20"
                        }`}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          chat.selectOwnerCommand(command.value);
                        }}
                        onMouseEnter={() => chat.setSelectedOwnerCommandIndex(index)}
                      >
                        <span className="block text-[12px] font-bold leading-[16px] text-[#ff8c13]">
                          {command.label}
                        </span>
                        <span className="block text-[11px] leading-[15px] text-white/75">
                          {command.description}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  aria-label="Chọn biểu cảm"
                  aria-expanded={chat.isEmojiPickerOpen}
                  disabled={!chat.canChat}
                  onClick={() => chat.setIsEmojiPickerOpen((isCurrentOpen) => !isCurrentOpen)}
                  className="flex h-full shrink-0 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Image
                    src={chatPanelAssets.smile}
                    alt=""
                    width={28}
                    height={24}
                    className="shrink-0"
                    aria-hidden
                  />
                </button>
                <input
                  ref={chat.inputRef}
                  className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-extralight text-white outline-none placeholder:text-[#8f8f8f]"
                  readOnly={!chat.canChat}
                  placeholder={
                    chat.canChat ? "Chia sẻ cảm xúc của bạn" : "Đăng nhập để chat"
                  }
                  value={chat.input}
                  onChange={(event) => {
                    if (chat.canChat) {
                      const nextInput = event.target.value;
                      chat.setInput(nextInput);
                      chat.setIsOwnerCommandPopupOpen(nextInput.trim().startsWith("@"));
                      chat.setSelectedOwnerCommandIndex(0);
                    }
                  }}
                  onFocus={chat.requestLoginForChat}
                  onKeyDown={(event) => {
                    if (!chat.canChat) {
                      event.preventDefault();
                      chat.requestLoginForChat();
                      return;
                    }
                    if (chat.filteredOwnerCommands.length) {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        chat.setSelectedOwnerCommandIndex(
                          (current) => (current + 1) % chat.filteredOwnerCommands.length,
                        );
                        return;
                      }
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        chat.setSelectedOwnerCommandIndex(
                          (current) =>
                            (current - 1 + chat.filteredOwnerCommands.length) %
                            chat.filteredOwnerCommands.length,
                        );
                        return;
                      }
                      if (event.key === "Enter") {
                        event.preventDefault();
                        const selectedCommand =
                          chat.filteredOwnerCommands[chat.selectedOwnerCommandIndex] ||
                          chat.filteredOwnerCommands[0];
                        chat.selectOwnerCommand(selectedCommand.value);
                        return;
                      }
                    }
                    if (event.key === "Enter") {
                      chat.sendMessage();
                    }
                  }}
                />
              </div>
              <button
                className="h-full w-[62px] shrink-0 cursor-pointer rounded-[4px] border border-[#cfd1d2] bg-[#f68c1f] text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!chat.canChat || !chat.input.trim() || chat.isSending}
                onClick={() => chat.sendMessage()}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      </aside>
      {chat.isAuthOpen ? (
        <AuthModal
          isOpen={chat.isAuthOpen}
          onAuthenticated={() => chat.setIsAuthOpen(false)}
          onClose={() => chat.setIsAuthOpen(false)}
        />
      ) : null}
    </>
  );
}

function SocialIconLink({
  children,
  href,
  label,
}: {
  children: ReactNode;
  href?: string;
  label: string;
}) {
  if (!href) {
    return <span aria-label={label}>{children}</span>;
  }

  return (
    <a aria-label={label} href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  );
}

function ChatBanner({
  liveRoomSettings,
}: {
  liveRoomSettings: LiveRoomSettings;
}) {
  const imageUrl = getAssetImageUrl(liveRoomSettings.chatBannerImageUrl);
  const content = liveRoomSettings.chatBannerContent?.trim();
  const href = liveRoomSettings.chatBannerLinkUrl || undefined;
  const shouldShowImage =
    Boolean(imageUrl) &&
    (liveRoomSettings.chatBannerType === "image" || !content);
  const shouldShowContent =
    Boolean(content) &&
    (liveRoomSettings.chatBannerType === "content" || !imageUrl);

  if (shouldShowImage) {
    return (
      <a
        className="mx-[5px] mt-[4px] block h-[58px] shrink-0 overflow-hidden rounded-[5px] border border-[#12b876] bg-[#07351f]"
        href={href}
        rel="noopener noreferrer"
        target={href ? "_blank" : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="block h-full w-full object-cover"
          src={imageUrl}
        />
      </a>
    );
  }

  if (!shouldShowContent) {
    return (
      <div className="mx-[5px] mt-[4px] h-[58px] shrink-0 overflow-hidden rounded-[5px]">
        <Image
          src={chatPanelAssets.okfun}
          alt="OKFUN"
          width={350}
          height={56}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <a
      className="mx-[5px] mt-[4px] block min-h-[58px] shrink-0 rounded-[5px] border border-[#12b876] bg-[#07351f] px-[8px] py-[7px] text-[12px] font-bold leading-[20px] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] [&_a]:text-[#ffe66b] [&_em]:text-[#ffe66b] [&_p]:m-0 [&_strong]:text-[#ffe66b]"
      href={href}
      rel="noopener noreferrer"
      target={href ? "_blank" : undefined}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

function AdminNoticeCard({
  liveRoomSettings,
}: {
  liveRoomSettings: LiveRoomSettings;
}) {
  const messageLinks = [
    {
      href: liveRoomSettings.zaloUrl,
      label: "nhắn tin\nZalo",
    },
    {
      href: liveRoomSettings.telegramUrl,
      label: "nhắn tin\ntelegram",
    },
    {
      href: liveRoomSettings.facebookUrl,
      label: "nhắn tin\nfacebook",
    },
  ];

  return (
    <div className="mt-[14px] mb-[18px] overflow-hidden rounded-[10px] bg-[linear-gradient(180deg,#686868_0%,#5b5b5b_100%)]">
      <div className="flex h-[20px] items-center gap-[4px] bg-[linear-gradient(180deg,#fd8901_0%,#ffa54e_100%)] px-[10px]">
        <Image src={chatPanelAssets.chat} alt="" width={16} height={16} aria-hidden />
        <span className="text-[12px] font-black capitalize leading-none text-white">
          admin
        </span>
      </div>
      <div className="px-[9px] py-[6px] text-[14px] font-medium capitalize leading-[19.5px] text-white">
        <p>
          Tele: <ExternalLink href={liveRoomSettings.telegramUrl} />
        </p>
        <p>
          Kênh tổng hợp: <ExternalLink href={liveRoomSettings.telegramChannelUrl} />
        </p>
        <p>
          OKFUN: <ExternalLink href={liveRoomSettings.registerButtonUrl} />
        </p>
        <p>
          Facebook: <ExternalLink href={liveRoomSettings.facebookUrl} />
        </p>
        {liveRoomSettings.zaloUrl ? (
          <p>
            Zalo: <ExternalLink href={liveRoomSettings.zaloUrl} />
          </p>
        ) : null}
      </div>
      <div className="mx-[18px] mb-[8px] grid grid-cols-2 gap-[8px]">
        <LiveRoomActionLink
          href={liveRoomSettings.registerButtonUrl}
          label={liveRoomSettings.registerButtonLabel}
        />
        <LiveRoomActionLink
          href={liveRoomSettings.groupButtonUrl}
          label={liveRoomSettings.groupButtonLabel}
        />
      </div>
      <div className="mx-[18px] mb-[8px] flex h-[40px] items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#fd8901_0%,#ffa54e_100%)] px-[5px] shadow-[inset_0_0_10px_rgba(255,236,228,.6)]">
        {messageLinks.map((item, index) => (
          <a
            key={item.label}
            aria-disabled={!item.href}
            className={`flex h-[30px] w-[80px] items-center justify-center whitespace-pre-line text-center text-[12px] font-bold capitalize leading-[14px] text-white ${
              index === 0 ? "border-r border-white" : index === 2 ? "border-l border-white" : ""
            } ${item.href ? "cursor-pointer" : "pointer-events-none cursor-default opacity-55"}`}
            href={item.href || undefined}
            rel="noopener noreferrer"
            target="_blank"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function ExternalLink({ href }: { href?: string }) {
  return (
    <a
      className="text-[#ff9b0e] underline"
      href={href || undefined}
      rel="noopener noreferrer"
      target="_blank"
    >
      {href}
    </a>
  );
}

function LiveRoomActionLink({ href, label }: { href?: string; label: string }) {
  return (
    <a
      className="flex h-[34px] items-center justify-center rounded-[8px] bg-[linear-gradient(180deg,#fd8901_0%,#ffa54e_100%)] px-2 text-center text-[13px] font-bold text-white shadow-[inset_0_0_10px_rgba(255,236,228,.5)]"
      href={href || undefined}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function ChatMessageLine({
  canPin,
  liveRoomSettings,
  message,
  onPin,
}: {
  canPin?: boolean;
  liveRoomSettings: LiveRoomSettings;
  message: ChatLine;
  onPin?: (message: ChatLine) => void;
}) {
  const initial = message.sender.trim().slice(0, 1).toUpperCase() || "U";
  const sticker = chatEmojiOptions.find(
    (emoji) => emoji.token === message.content.trim(),
  );
  const isAdminMessage =
    message.role === "admin" ||
    message.role === "ADMIN" ||
    message.role === "OWNER";
  const isFeaturedChatRole =
    String(message.role || "").toUpperCase() === "BLV" ||
    String(message.role || "").toUpperCase() === "STREAMER";

  if (message.content.trim() === ADMIN_INFO_COMMAND) {
    return <AdminNoticeCard liveRoomSettings={liveRoomSettings} />;
  }

  return (
    <div className="group mb-[10px] flex min-w-0 items-start gap-[4px] text-[12px] font-light leading-[20px] tracking-[.24px] text-white">
      <span className="relative mt-[1px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#f68c1f]/70 bg-[#3a3a3a] text-[9px] font-bold leading-none text-white">
        {message.avatarUrl ? (
          <Image
            src={getAssetImageUrl(message.avatarUrl) || message.avatarUrl}
            alt=""
            fill
            className="object-cover"
            sizes="18px"
          />
        ) : (
          initial
        )}
      </span>
      <p className="min-w-0 flex-1 break-words">
        {isAdminMessage ? (
          <span className="mr-[4px] rounded-[3px] bg-[#ff8c13] px-[4px] py-[1px] text-[10px] font-bold uppercase leading-none text-white">
            admin
          </span>
        ) : null}
        <b
          className={`font-medium ${
            isFeaturedChatRole
              ? "mr-[4px] inline-flex items-center justify-center gap-[2px] rounded-[3px] border border-[#f8d36b] px-[4px] py-[1px] text-[#f8d36b]"
              : "text-[#f68c1f]"
          }`}
        >
          {message.sender}
          {isFeaturedChatRole ? <FeaturedRoleFire /> : null}:
        </b>{" "}
        {sticker ? (
          <span className="relative ml-[4px] inline-flex h-[65px] w-[65px] align-middle">
            <Image
              src={sticker.src}
              alt={sticker.label}
              fill
              sizes="65px"
              className="object-contain"
            />
          </span>
        ) : (
          message.content
        )}
        {canPin ? (
          <button
            type="button"
            className="ml-[6px] cursor-pointer rounded-[3px] border border-[#f68c1f]/60 px-[5px] py-[1px] text-[10px] font-medium leading-none text-[#f68c1f] opacity-0 transition hover:bg-[#f68c1f] hover:text-white group-hover:opacity-100"
            onClick={() => onPin?.(message)}
          >
            Ghim
          </button>
        ) : null}
      </p>
    </div>
  );
}

function FeaturedRoleFire() {
  return (
    <span className="inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center align-middle">
      <Lottie
        animationData={fireAnimation}
        autoplay
        loop
        className="h-[16px] w-[16px]"
      />
    </span>
  );
}

function PinnedChatMessage({
  canUnpin,
  liveRoomSettings,
  message,
  onUnpin,
}: {
  canUnpin: boolean;
  liveRoomSettings: LiveRoomSettings;
  message: ChatLine;
  onUnpin: () => void;
}) {
  return (
    <div className="mx-[10px] mt-[6px] shrink-0 rounded-[7px] border border-[#f68c1f] bg-[#1b1b1b] px-[10px] py-[7px] shadow-[0_4px_14px_rgba(0,0,0,.28)]">
      <div className="mb-[4px] flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase leading-none text-[#f68c1f]">
          Tin nhắn ghim
        </span>
        {canUnpin ? (
          <button
            type="button"
            className="cursor-pointer text-[11px] font-medium leading-none text-white/70 hover:text-white"
            onClick={onUnpin}
          >
            Bỏ ghim
          </button>
        ) : null}
      </div>
      <ChatMessageLine
        canPin={false}
        liveRoomSettings={liveRoomSettings}
        message={message}
      />
    </div>
  );
}
