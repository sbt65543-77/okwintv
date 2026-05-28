export type SectionKind = "hot" | "sports" | "esports" | "casino" | "idol";

export type HomeCategory = {
  id: "sports" | "esports" | "casino" | "idol";
  title: string;
  apiCategoryName: string;
  icon: string;
  sectionId: string;
  kind: SectionKind;
};

export const homeCategories = [
  {
    id: "sports",
    title: "Thể thao",
    apiCategoryName: "Thể thao",
    icon: "⚽",
    sectionId: "sports",
    kind: "sports",
  },
  {
    id: "esports",
    title: "Esports",
    apiCategoryName: "Esports",
    icon: "🎮",
    sectionId: "esports",
    kind: "esports",
  },
  {
    id: "casino",
    title: "Casino",
    apiCategoryName: "Casino",
    icon: "🎲",
    sectionId: "casino",
    kind: "casino",
  },
  {
    id: "idol",
    title: "Idol Live",
    apiCategoryName: "Idol live",
    icon: "♞",
    sectionId: "idol-live",
    kind: "idol",
  },
] satisfies HomeCategory[];

export type CardItem = {
  title: string;
  kind: "match" | "casino" | "idol" | "promo" | "video";
  home?: string;
  away?: string;
  live?: boolean;
};

export const sidebarItems = [
  {
    iconSrc: "/assets/navbars/home.svg",
    label: "Trang Chủ",
    href: "/",
    active: true,
  },
  {
    iconSrc: "/assets/navbars/lich_phat_song.svg",
    label: "Lịch Phát Sóng",
    href: "/lich-phat-song",
    active: false,
  },
  {
    iconSrc: "/assets/navbars/event.svg",
    label: "Sự Kiện Và Khuyến Mãi",
    href: "#promotions",
    active: false,
    badge: "🔥",
  },
  {
    iconSrc: "/assets/navbars/qua.svg",
    label: "Quà Tặng",
    href: "#gifts",
    active: false,
  },
  {
    iconSrc: "/assets/navbars/video.svg",
    label: "Video Nổi Bật",
    href: "#videos",
    active: false,
  },
  {
    iconSrc: "/assets/navbars/tin_tuc.svg",
    label: "Tin Tức",
    href: "#news",
    active: false,
  },
  {
    iconSrc: "/assets/navbars/mini_game.svg",
    label: "Mini Game",
    href: "#home",
    active: false,
  },
] as const;

export const sectionCards: Record<SectionKind, CardItem[]> = {
  hot: [
    { kind: "match", title: "Ngoại hạng Anh", home: "Man City", away: "Man Utd", live: true },
    { kind: "match", title: "NBA", home: "Raptors", away: "Bucks", live: true },
    { kind: "match", title: "LOL", home: "AL", away: "T1", live: true },
    { kind: "casino", title: "Cùng bé cà rốt phát Code 88K" },
    { kind: "casino", title: "Cùng bé cà rốt phát Code 88K" },
    { kind: "idol", title: "Cùng bé Cà Rốt phát Code 88K" },
    { kind: "casino", title: "Cùng bé Cà Rốt phát Code 88K" },
    { kind: "promo", title: "Cùng bé Cà Rốt phát Code 88K" },
  ],
  sports: [
    { kind: "match", title: "Ngoại hạng Anh", home: "Man City", away: "Man Utd", live: true },
    { kind: "match", title: "NBA", home: "Raptors", away: "Bucks", live: true },
    { kind: "match", title: "Ngoại hạng Anh", home: "Man City", away: "Man Utd" },
  ],
  esports: [
    { kind: "match", title: "LOL", home: "AL", away: "T1", live: true },
    { kind: "match", title: "LOL", home: "AL", away: "T1", live: true },
    { kind: "match", title: "LOL", home: "AL", away: "T1", live: true },
  ],
  casino: [
    { kind: "casino", title: "Cùng bé Cà Rốt phát Code 88K" },
    { kind: "idol", title: "Cùng bé Cà Rốt phát Code 88K" },
    { kind: "casino", title: "Cùng bé Cà Rốt phát Code 88K" },
  ],
  idol: [
    { kind: "idol", title: "Cùng bé Cà Rốt phát Code 88K" },
    { kind: "idol", title: "Cùng bé Cà Rốt phát Code 88K" },
    { kind: "casino", title: "Cùng bé Cà Rốt phát Code 88K" },
  ],
};

export const streamerNames = [
  "Coca",
  "Coca",
  "Coca",
  "Coca",
  "Coca",
  "Coca",
  "Coca",
  "Coca",
  "Coca",
];

export const gifts = [
  ["Bình giữ nhiệt OKWINTV", "300", "50.000"],
  ["Bình giữ nhiệt OKWINTV", "300", "50.000"],
  ["Áo Polo OKWINTV", "300", "50.000"],
  ["Áo Polo OKWINTV", "300", "50.000"],
] as const;

export const promoCards = new Array(4).fill(null);
export const videoCards = new Array(6).fill(null);
