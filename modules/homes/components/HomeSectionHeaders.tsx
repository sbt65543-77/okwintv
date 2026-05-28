import Image from "next/image";

type CategoryKind = "sports" | "esports" | "casino" | "idol";

const categoryHeaderIconSrc: Record<CategoryKind, string> = {
  sports: "/assets/ic_white_sport.svg",
  esports: "/assets/ic_white_esports.svg",
  casino: "/assets/ic_white_casino.svg",
  idol: "/assets/ic_white_idol.svg",
};

const categoryTitleBoxClass =
  "flex h-[36px] min-w-0 max-w-[calc(100vw_-_150px)] items-center gap-[5px] rounded-r-[10px] bg-[#F68C1F] px-[10px] text-[18px] font-medium capitalize leading-none text-white sm:h-[40px] sm:w-[200px] sm:max-w-none sm:text-[28px]";
const defaultTitleBoxClass =
  "flex min-h-[38px] min-w-0 items-center gap-[8px] rounded-[5px] bg-[linear-gradient(180deg,#FD8901_0%,#FFA54E_100%)] pl-3 pr-4 text-[25px] font-medium leading-none text-white sm:min-w-[198px] sm:pr-6 sm:text-[24px] 2xl:h-[41px] 2xl:text-[26px]";

export function FullHeader({
  icon,
  iconSrc,
  onViewAll,
  showViewAll = true,
  title,
}: {
  icon?: string;
  iconSrc?: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
  title: string;
}) {
  return (
    <div className="flex min-h-[42px] items-center justify-between gap-3 rounded-t-[10px] bg-[linear-gradient(180deg,#FD8901_0%,#FFA54E_100%)] py-2 pl-4 pr-3 2xl:h-[42px] 2xl:py-0">
      <h2 className="text-[18px] font-black leading-none sm:text-[20px] 2xl:text-[22px]">
        {iconSrc ? (
          <span className="relative mr-2 inline-block h-[22px] w-[22px] align-[-4px] sm:h-[24px] sm:w-[24px] 2xl:h-[26px] 2xl:w-[26px]">
            <Image
              src={iconSrc}
              alt=""
              fill
              sizes="26px"
              className="object-contain"
              aria-hidden
            />
          </span>
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {title}
      </h2>
      <button
        className="inline-flex h-[36px] shrink-0 cursor-pointer items-center justify-center gap-[10px] rounded-[5px] px-[10px] py-[8px] text-white"
        type="button"
        onClick={onViewAll}
      >
        <span className="flex h-[20px] min-w-[92px] flex-col justify-center text-[20px] font-medium leading-none sm:text-[16px] 2xl:h-[36px] 2xl:min-w-[110px] 2xl:text-[20px]">
          Xem Tất Cả
        </span>
        <span className="relative h-[22px] w-[22px] shrink-0 2xl:h-[26px] 2xl:w-[26px]">
          <Image
            src="/assets/navbars/ic_all.svg"
            alt=""
            fill
            sizes="26px"
            className="object-contain"
            aria-hidden
          />
        </span>
      </button>
    </div>
  );
}

export function CategoryHeader({
  icon,
  kind,
  title,
}: {
  icon?: string;
  kind?: CategoryKind;
  title: string;
}) {
  const iconSrc = kind ? categoryHeaderIconSrc[kind] : undefined;
  const isCategory = Boolean(kind);

  return (
    <div className="mb-[10px] flex min-h-[38px] items-center justify-between gap-2 sm:mb-[14px] sm:min-h-[41px] sm:gap-3">
      <h2 className={isCategory ? categoryTitleBoxClass : defaultTitleBoxClass}>
        {iconSrc ? (
          <span
            className={
              isCategory
                ? "relative h-[22px] w-[22px] shrink-0 sm:h-[30px] sm:w-[30px]"
                : "relative h-[22px] w-[22px] shrink-0 sm:h-[26px] sm:w-[26px]"
            }
          >
            <Image
              src={iconSrc}
              alt=""
              fill
              sizes={isCategory ? "30px" : "26px"}
              className="object-contain"
              aria-hidden
            />
          </span>
        ) : icon ? (
          <span className="text-[20px] sm:text-[24px]">{icon}</span>
        ) : null}
        <span className="truncate">{title}</span>
      </h2>
      <a
        className="inline-flex h-[32px] shrink-0 cursor-pointer items-center justify-center gap-[6px] rounded-[5px] px-[4px] py-[6px] text-white sm:h-[36px] sm:gap-[10px] sm:px-[10px] sm:py-[8px]"
        href="#home"
      >
        <span className="flex h-[20px] min-w-0 flex-col justify-center whitespace-nowrap text-[12px] font-medium leading-none sm:min-w-[92px] sm:text-[16px] 2xl:h-[36px] 2xl:min-w-[110px] 2xl:text-[20px]">
          Xem Tất Cả
        </span>
        <span className="relative h-[18px] w-[18px] shrink-0 sm:h-[22px] sm:w-[22px] 2xl:h-[26px] 2xl:w-[26px]">
          <Image
            src="/assets/navbars/ic_all.svg"
            alt=""
            fill
            sizes="26px"
            className="object-contain"
            aria-hidden
          />
        </span>
      </a>
    </div>
  );
}

export function CarouselArrow({
  direction = "right",
  onClick,
}: {
  direction?: "left" | "right";
  onClick?: () => void;
}) {
  const isLeft = direction === "left";

  return (
    <button
      className={`absolute top-1/2 z-30 hidden h-[30px] w-[30px] -translate-y-1/2 cursor-pointer items-center justify-center sm:flex 2xl:h-[34px] 2xl:w-[34px] ${
        isLeft ? "2xl:left-[18%]" : "right-0 2xl:right-2.25"
      }`}
      type="button"
      onClick={onClick}
    >
      <Image
        src={
          isLeft ? "/assets/ic_arrow_left.svg" : "/assets/ic_arrow_right.svg"
        }
        alt=""
        fill
        sizes="34px"
        className="object-contain"
        aria-hidden
      />
    </button>
  );
}

export function Dots({
  activeIndex = 0,
  count = 4,
  onSelect,
}: {
  activeIndex?: number;
  count?: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <div className="mt-[8px] flex justify-center gap-[10px]">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          className={`h-[7px] w-[7px] rounded-full transition ${
            index === activeIndex ? "bg-white" : "bg-white/55"
          }`}
          type="button"
          aria-label={`Chuyển đến slide ${index + 1}`}
          onClick={() => onSelect?.(index)}
        />
      ))}
    </div>
  );
}
