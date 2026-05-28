import { AboutCopy } from "./AboutSectionParts";
import { FullHeader } from "../HomeSectionHeaders";

export default function AboutSection() {
  return (
    <section id="about" className="mt-[22px]">
      <FullHeader icon="ℹ" title="Giới Thiệu Về OKWINTV" />
      <div className="grid grid-cols-1 gap-[22px] rounded-b-[5px] border border-[#ff8c13] bg-[#202020] p-4 text-[13px] leading-6 text-[#d0d0d0] md:grid-cols-[260px_1fr] md:p-5 2xl:grid-cols-[345px_1fr] 2xl:gap-[28px] 2xl:p-[26px]">
        <nav className="grid content-start gap-4">
          {[
            "OKWINTV",
            "OKWINTV LÀ GÌ?",
            "Lịch sử hình thành của OKWINTV",
            "Mục đích thành lập của OKWINTV",
            "Những ưu điểm nổi bật của OKWINTV",
            "KẾT LUẬN",
          ].map((item, index) => (
            <a
              key={item}
              className={index === 0 ? "font-black text-[#ff8c13]" : "text-white/80"}
              href="#about"
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="grid gap-5">
          <AboutCopy title="OKWINTV - Nền tảng phát sóng trực tiếp bóng đá và Esport 24/7 miễn phí" />
          <AboutCopy title="OKWINTV là gì?" />
          <AboutCopy title="Lịch sử hình thành của OKWINTV" />
        </div>
      </div>
    </section>
  );
}

