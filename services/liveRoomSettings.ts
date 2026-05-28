import { Axios } from "./Axios";

export interface LiveRoomSettings {
  facebookUrl: string;
  tiktokUrl: string;
  telegramUrl: string;
  telegramChannelUrl: string;
  zaloUrl: string;
  customerSupportUrl: string;
  registerButtonLabel: string;
  registerButtonUrl: string;
  groupButtonLabel: string;
  groupButtonUrl: string;
  chatBannerType: "image" | "content";
  chatBannerImageUrl: string;
  chatBannerContent: string;
  chatBannerLinkUrl: string;
}

export const defaultLiveRoomSettings: LiveRoomSettings = {
  facebookUrl: "https://www.facebook.com/OkwinTV",
  tiktokUrl: "",
  telegramUrl: "https://t.me/okwintv6868",
  telegramChannelUrl: "https://t.me/okwintvchanel",
  zaloUrl: "",
  customerSupportUrl: "",
  registerButtonLabel: "Đăng ký",
  registerButtonUrl: "https://chlive03.01okfun.com/register.html",
  groupButtonLabel: "Vào nhóm",
  groupButtonUrl: "https://t.me/okwintv6868",
  chatBannerType: "content",
  chatBannerImageUrl: "",
  chatBannerContent: "",
  chatBannerLinkUrl: "",
};

export const getLiveRoomSettings = async (): Promise<LiveRoomSettings> => {
  const response = await Axios(false).get<Partial<LiveRoomSettings>>("/live-room-settings");

  return {
    ...defaultLiveRoomSettings,
    ...(response.data || {}),
  };
};
