import { CategoryHeader } from "./HomeSectionHeaders";
import { videoCards } from "./homeData";

export default function VideoSection() {
  return (
    <section id="videos" className="mt-[22px]">
      <CategoryHeader icon="🎬" title="Video Nổi Bật" />
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        {videoCards.map((_, index) => (
          <article
            key={index}
            className="cursor-pointer overflow-hidden rounded-[4px] bg-[#2e2e2e]"
          >
            <div className="relative h-[118px] bg-[linear-gradient(135deg,#0a542f,#d9d9d9_48%,#248236)]">
              <span className="absolute bottom-2 left-2 rounded bg-[#ff8c13] px-2 py-0.5 text-[11px] font-bold">
                03:02
              </span>
            </div>
            <div className="p-2">
              <div className="mb-1 w-fit bg-[#ff8c13] px-2 text-[10px] font-bold">
                Highlight
              </div>
              <h3 className="line-clamp-2 text-[12px] font-bold leading-[17px]">
                Man Utd thắng đậm, Arsenal ca...
              </h3>
              <p className="mt-1 text-[10px] text-[#aaa]">06/11/2025</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
