import OkwinLogo from "./OkwinLogo";

export default function OkwinFooter() {
  return (
    <footer className="bg-[#252525] text-white sm:bg-[#111]">
      <div className="px-4 pb-5 pt-4 sm:hidden">
        <div className="mb-3 flex items-center justify-center gap-4">
          <OkwinLogo compact />
          <span className="h-8 w-px bg-white/60" />
          <span className="text-[20px] font-black text-[#ff8c13]">OKWIN</span>
        </div>
        <div className="mb-3 flex items-center justify-between text-[15px] font-semibold text-[#cfcfcf]">
          <span className="flex items-center gap-2">
            <span className="text-[20px]">⚙</span>
            Về Chúng Tôi
          </span>
          <span className="flex items-center gap-5 text-[22px]">
            <span>●</span>
            <span>▶</span>
            <span>♪</span>
            <span>↗</span>
          </span>
        </div>
        <div className="grid text-[15px] text-[#d0d0d0]">
          {[
            "Giới Thiệu",
            "Liên Hệ",
            "Chính Sách Bảo Mật",
            "Thỏa Thuận Phát Sóng Trực Tiếp",
            "Cam Kết Và Thỏa Thuận Người Dùng",
          ].map((link) => (
            <a
              key={link}
              className="flex h-[35px] items-center gap-2 border-b border-white/45"
              href="#about"
            >
              <span className="text-[22px] leading-none">»</span>
              {link}
            </a>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[13px] text-white">
          <span className="rounded-[2px] bg-[#f4d34d] px-1.5 py-0.5 text-[11px] font-black text-[#1d1d1d]">
            DMCA
          </span>
          <span>Website OKWINTV Được Bảo Vệ Bởi DMCA</span>
        </div>
      </div>

      <div className="mx-auto hidden max-w-[1920px] grid-cols-1 sm:grid 2xl:grid-cols-[250px_minmax(0,1fr)]">
        <div className="hidden 2xl:block" />
        <div className="min-w-0 overflow-hidden px-4 pb-10 pt-8 sm:px-5 md:px-8 2xl:px-8 2xl:pb-[56px] 2xl:pt-[46px]">
          <div className="mx-auto w-full max-w-[min(1420px,calc(100vw_-_314px))] bg-[#303030] px-4 pb-[28px] pt-[30px] text-center sm:px-6 2xl:px-[34px]">
            <div className="flex flex-col items-center justify-center gap-5 lg:flex-row 2xl:gap-[50px]">
              <OkwinLogo />
              <OkwinLogo compact />
              <div className="flex flex-wrap items-center justify-center gap-4 text-[20px] lg:ml-8 2xl:ml-16 2xl:gap-6">
                <span className="text-[18px]">Theo Dõi Chúng Tôi:</span>
                <span>●</span>
                <span>▶</span>
                <span>♪</span>
                <span>↗</span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-4 text-[14px] font-bold text-[#dedede] 2xl:gap-8">
              {[
                "Giới thiệu",
                "Liên hệ",
                "Chính sách và bảo mật",
                "Thỏa thuận phát sóng trực tiếp",
                "Cam kết và bảo mật",
              ].map((link) => (
                <a key={link} className="cursor-pointer" href="#about">
                  {link}
                </a>
              ))}
            </div>
            <p className="mt-5 text-[12px] text-[#bdbdbd]">
              OKWINTV - Xem trực tiếp thể thao và esport full HD 4K miễn phí hôm
              nay.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
