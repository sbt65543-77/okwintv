"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = [
  {
    href: "/lich-phat-song",
    icon: "/assets/menu_mobiles/Layer_1.svg",
    label: "Lịch Trình",
  },
  {
    href: "/#khuyen-mai",
    icon: "/assets/menu_mobiles/Group.svg",
    label: "Khuyến Mãi",
  },
  {
    href: "/",
    icon: "/assets/menu_mobiles/lives.svg",
    label: "Trang Chủ",
    featured: true,
  },
  {
    href: "/#gift",
    icon: "/assets/menu_mobiles/gift.svg",
    label: "Quà Tặng",
  },
  {
    href: "/profile",
    icon: "/assets/menu_mobiles/user.svg",
    label: "Cá Nhân",
  },
];

export default function MobileBottomMenu() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isMenuItemActive = (href: string) => {
    if (href.includes("#")) {
      const [hrefPath, hrefHash] = href.split("#");

      return pathname === hrefPath && hash === `#${hrefHash}`;
    }

    return pathname === href && !hash;
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[70] block h-[86px] text-white sm:hidden"
      aria-label="Menu mobile"
    >
      <div className="absolute inset-x-0 top-[15px] h-[71px] rounded-t-[13px] bg-[linear-gradient(180deg,#333_0%,#252525_56%,#1b1b1b_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,.06)]" />
      <div className="absolute left-1/2 top-[15px] z-[1] h-10.75 w-[60px] -translate-x-1/2 rounded-b-[30px] bg-[#080808]" />
      <div className="relative z-10 grid h-[71px] grid-cols-5 items-end">
        {menuItems.map((item) => {
          const isActive = isMenuItemActive(item.href);
          const iconActiveClass =
            "[filter:brightness(0)_saturate(100%)_invert(55%)_sepia(98%)_saturate(1343%)_hue-rotate(359deg)_brightness(101%)_contrast(99%)]";

          if (item.featured) {
            return (
              <Link
                key={item.label}
                className={`flex h-[86px] flex-col items-center justify-start pt-[2px] ${
                  isActive ? "text-[#fd8901]" : "text-white"
                }`}
                href={item.href}
              >
                <span
                  className={`flex h-[50px] w-[50px] items-center justify-center rounded-full border-[3px] shadow-[0_2px_8px_rgba(0,0,0,.42)] ${
                    isActive
                      ? "border-white bg-[linear-gradient(180deg,#ff9c24_0%,#ff8611_100%)]"
                      : "border-[#5a5a5a] bg-[linear-gradient(180deg,#3b3b3b_0%,#242424_100%)]"
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={33}
                    height={30}
                    className={`h-[25px] w-[25px] object-contain ${
                      isActive ? "" : "brightness-0 invert"
                    }`}
                    aria-hidden
                  />
                </span>
                <span className="mt-[7px] text-[12px] font-normal leading-[16px]">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              className={`flex h-[71px] flex-col items-center justify-center gap-[5px] pb-[8px] pt-[11px] ${
                isActive ? "text-[#fd8901]" : "text-white"
              }`}
              href={item.href}
            >
              <span className="relative flex h-[25px] w-[33px] items-center justify-center">
                <Image
                  src={item.icon}
                  alt=""
                  width={33}
                  height={25}
                  className={`max-h-[25px] w-auto object-contain ${
                    isActive ? iconActiveClass : "brightness-0 invert"
                  }`}
                  aria-hidden
                />
              </span>
              <span className="whitespace-nowrap text-[12px] font-normal leading-[16px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
