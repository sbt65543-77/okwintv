export type Language = "vi" | "en";

export type Match = {
  league: string;
  home: string;
  away: string;
  homeLogo: string;
  awayLogo: string;
};

export const translations = {
  vi: {
    languageName: "Tiếng Việt",
    languageSelectLabel: "Chọn ngôn ngữ",
    nav: ["Trang chủ", "Trận đấu", "Trực tiếp", "Tin tức", "Mẹo", "VIP"],
    appButton: "APP",
    authAction: "Đăng nhập/Đăng ký",
    featuredTitle: "Danh sách nổi bật",
    matchBadge: "TV",
    versus: "VS",
    matches: [
      {
        league: "Giải bóng đá chuyên nghiệp",
        home: "Kyoto",
        away: "Gamba",
        homeLogo: "K",
        awayLogo: "G",
      },
      {
        league: "Giải bóng đá chuyên nghiệp",
        home: "Kim cương",
        away: "Mặt trăng",
        homeLogo: "U",
        awayLogo: "K",
      },
      {
        league: "Giải bóng đá chuyên nghiệp",
        home: "Cá voi",
        away: "Fagiano",
        homeLogo: "M",
        awayLogo: "F",
      },
      {
        league: "Giải bóng đá chuyên nghiệp",
        home: "Kashima",
        away: "Tokyo",
        homeLogo: "A",
        awayLogo: "T",
      },
    ],
    news: [
      "Xác định các tay vợt lọt tứ kết Madrid...",
      "Lịch thi đấu tennis 29/4: Hấp dẫn từ k...",
      "'Tiểu Federer' phải dự Roland Garros...",
      "Lịch thi đấu bóng chuyền hôm nay 29/4",
      "Francis Ngannou: 'Alex Pereira không...",
      "U17 Triều Tiên chính thức rút lui, Việt...",
      "U17 Thái Lan nhận 'lệnh cấm' trước n...",
      "ĐÁNG TIẾC: Thủ môn Việt kiều bị d...",
      "2 cầu thủ Việt kiều được gọi lên U19...",
      "U17 Việt Nam sẵn sàng dự VCK châu...",
    ],
  },
  en: {
    languageName: "English",
    languageSelectLabel: "Select language",
    nav: ["Home", "Matches", "Live", "News", "Tips", "VIP"],
    appButton: "APP",
    authAction: "Login/Register",
    featuredTitle: "Featured list",
    matchBadge: "TV",
    versus: "VS",
    matches: [
      {
        league: "Professional football league",
        home: "Kyoto",
        away: "Gamba",
        homeLogo: "K",
        awayLogo: "G",
      },
      {
        league: "Professional football league",
        home: "Diamond",
        away: "Moon",
        homeLogo: "U",
        awayLogo: "K",
      },
      {
        league: "Professional football league",
        home: "Whales",
        away: "Fagiano",
        homeLogo: "M",
        awayLogo: "F",
      },
      {
        league: "Professional football league",
        home: "Kashima",
        away: "Tokyo",
        homeLogo: "A",
        awayLogo: "T",
      },
    ],
    news: [
      "Madrid quarterfinal tennis players confirmed...",
      "Tennis schedule 29/4: Key matches ahead...",
      "'Little Federer' must qualify for Roland Garros...",
      "Volleyball schedule today 29/4",
      "Francis Ngannou: 'Alex Pereira is not...",
      "North Korea U17 officially withdraws, Vietnam...",
      "Thailand U17 receives a restriction before...",
      "UNFORTUNATE: Overseas Vietnamese keeper...",
      "Two overseas Vietnamese players called to U19...",
      "Vietnam U17 ready for the Asian finals...",
    ],
  },
} as const;
