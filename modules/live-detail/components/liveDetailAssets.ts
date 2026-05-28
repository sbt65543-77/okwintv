export const panelIconBasePath = "/assets/icon_video_pannel";

export const videoPanelIcons = {
  live: `${panelIconBasePath}/iconLive.svg`,
  muted: `${panelIconBasePath}/iconMuted.svg`,
  pause: `${panelIconBasePath}/iconPause.svg`,
};

export const chatAssetBasePath = "/assets/detail_live/chats";

export const chatPanelAssets = {
  bxh: `${chatAssetBasePath}/ic_bxh.svg`,
  chat: `${chatAssetBasePath}/icon_chat.svg`,
  facebook: `${chatAssetBasePath}/ic_facebook.svg`,
  okfun: `${chatAssetBasePath}/img_ok_fun.png`,
  plane: `${chatAssetBasePath}/icon_maybay.svg`,
  smile: `${chatAssetBasePath}/ic_matcuoi.svg`,
  tiktok: `${chatAssetBasePath}/ic_tiktok.svg`,
};

const chatEmojiBasePath = `${chatAssetBasePath}/emoji`;

export const chatEmojiOptions = [
  {
    label: "Cố lên",
    src: `${chatEmojiBasePath}/emoji_2.svg`,
    token: "[sticker:co-len]",
  },
  {
    label: "Lụm",
    src: `${chatEmojiBasePath}/emoji_4.svg`,
    token: "[sticker:lum]",
  },
  {
    label: "Thua rồi",
    src: `${chatEmojiBasePath}/emoji_5.svg`,
    token: "[sticker:thua-roi]",
  },
  {
    label: "Cay",
    src: `${chatEmojiBasePath}/emoji_1.svg`,
    token: "[sticker:cay]",
  },
  {
    label: "Hay quá",
    src: `${chatEmojiBasePath}/emoji_3.svg`,
    token: "[sticker:hay-qua]",
  },
];

const profileVideoAssetBasePath = "/assets/detail_live/profile-videos";

export const profileVideoAssets = {
  eye: `${profileVideoAssetBasePath}/eye.svg`,
  follow: `${profileVideoAssetBasePath}/ic_follow.svg`,
  hot: `${profileVideoAssetBasePath}/hot.png`,
  mic: `${profileVideoAssetBasePath}/ic_mic.svg`,
  share: `${profileVideoAssetBasePath}/ic_share.svg`,
  video: `${profileVideoAssetBasePath}/video.svg`,
};

export const chatUnicodeEmojiOptions = [
  { label: "Mặt cười", value: "😀" },
  { label: "Cười lớn", value: "😄" },
  { label: "Cười ra nước mắt", value: "😂" },
  { label: "Yêu thích", value: "😍" },
  { label: "Hôn gió", value: "😘" },
  { label: "Ngầu", value: "😎" },
  { label: "Khóc", value: "😭" },
  { label: "Tức giận", value: "😡" },
  { label: "Bốc lửa", value: "🔥" },
  { label: "Vỗ tay", value: "👏" },
  { label: "Tim", value: "❤️" },
  { label: "Một trăm", value: "💯" },
  { label: "Cúp", value: "🏆" },
  { label: "Bóng đá", value: "⚽" },
  { label: "Tên lửa", value: "🚀" },
  { label: "Ngôi sao", value: "⭐" },
];
