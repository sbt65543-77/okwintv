import type { ReactNode } from "react";

export function LiveSectionState({ children }: { children: ReactNode }) {
  return (
    <div className="col-span-full flex h-[190px] items-center justify-center rounded-[5px] bg-[#2f2f2f] text-[14px] text-white/70 2xl:h-[205px]">
      {children}
    </div>
  );
}
