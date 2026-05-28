import { CategoryHeader } from "./HomeSectionHeaders";

export default function NewsSection() {
  return (
    <section id="news" className="mt-[22px]">
      <CategoryHeader icon="📰" title="Tin Tức" />
      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-[2fr_1.6fr]">
        <article className="cursor-pointer overflow-hidden rounded-[5px] bg-[#2d2d2d]">
          <div className="grid h-[220px] grid-cols-1 gap-2 bg-[#285d85] p-2 sm:h-[280px] sm:grid-cols-[1.6fr_1fr] 2xl:h-[322px]">
            <div className="rounded bg-[linear-gradient(135deg,#d5b78b,#79512d)]" />
            <div className="grid gap-2">
              <div className="rounded bg-[linear-gradient(135deg,#6d3f1c,#caab78)]" />
              <div className="rounded bg-[linear-gradient(135deg,#151515,#b8b8b8)]" />
            </div>
          </div>
          <div className="p-4">
            <div className="mb-2 flex gap-2 text-[12px] font-bold">
              <span className="bg-[#ff8c13] px-2">HOT</span>
              <span className="bg-[#ff8c13] px-2">Tin Thể Thao</span>
            </div>
            <h3 className="text-[17px] font-black">
              Nhận định Rangers vs AS Roma 03:00 07/11 - Soi kèo UEFA Europa
              League chuẩn OKWIN TV
            </h3>
            <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-[#bdbdbd]">
              Nhận định bóng đá Rangers vs AS Roma cùng OKWIN TV. Tỉ lệ kèo,
              phân tích phong độ và đội hình trước trận.
            </p>
          </div>
        </article>
        <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
          {new Array(6).fill(null).map((_, index) => (
            <article
              key={index}
              className="cursor-pointer overflow-hidden rounded-[5px] bg-[#2d2d2d]"
            >
              <div className="h-[104px] bg-[linear-gradient(135deg,#c7a77a,#333)]" />
              <div className="p-3">
                <div className="mb-2 w-fit bg-[#ff8c13] px-2 text-[10px] font-bold">
                  Tin Thể Thao
                </div>
                <h4 className="line-clamp-2 text-[12px] font-bold leading-[17px]">
                  Nhận định Rangers vs AS Roma 03:00 07/11...
                </h4>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
