import { CategoryHeader } from "./HomeSectionHeaders";
import { gifts } from "./homeData";

export default function GiftSection() {
  return (
    <section id="gifts" className="mt-[22px]">
      <CategoryHeader icon="🎁" title="Quà Tặng" />
      <div className="mb-[10px] flex min-h-[48px] gap-3 overflow-x-auto bg-[#242424] px-3 py-2 2xl:h-[48px]">
        {new Array(5).fill(null).map((_, index) => (
          <div
            key={index}
            className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full bg-[#3b3b3b] px-3 text-[12px] text-[#dcdcdc]"
          >
            <span className="h-[28px] w-[28px] rounded-full bg-[#c7a06c]" />
            Chúc mừng **username nhận được T...
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {gifts.map(([name, coin, price], index) => (
          <article
            key={`${name}-${index}`}
            className="cursor-pointer overflow-hidden rounded-[5px] border border-[#ff8c13] bg-[#222]"
          >
            <div className="relative h-[190px] bg-[linear-gradient(90deg,#ffbe61,#ffd18b,#ffb149)] sm:h-[218px] 2xl:h-[238px]">
              <div className="absolute left-0 right-0 top-0 bg-[#b87822] py-1 text-center text-[14px] font-bold">
                Còn Hàng
              </div>
              <div className="absolute left-1/2 top-[70px] h-[112px] w-[56px] -translate-x-1/2 rotate-[-17deg] rounded-[12px] bg-white shadow-xl" />
            </div>
            <div className="px-3 py-3">
              <h3 className="truncate text-[14px] font-bold">{name}</h3>
              <div className="mt-2 flex items-center gap-4 text-[13px]">
                <span className="text-[#a955ff]">{coin} ◆</span>
                <span className="text-[#ffca3a]">{price} ●</span>
                <button className="cursor-pointer ml-auto rounded bg-[#ff8c13] px-3 py-1 text-[11px] font-bold">
                  Đổi quà
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
