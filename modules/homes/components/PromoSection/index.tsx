import { PromoCard } from "./PromoSectionParts";
import { CategoryHeader } from "../HomeSectionHeaders";
import { promoCards } from "../homeData";

export default function PromoSection() {
  return (
    <section id="promos" className="mt-[22px]">
      <CategoryHeader icon="🔥" title="Sự Kiện Và Khuyến Mãi" />
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {promoCards.map((_, index) => (
          <PromoCard key={index} />
        ))}
      </div>
    </section>
  );
}

