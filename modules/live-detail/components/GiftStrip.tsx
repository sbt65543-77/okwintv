export default function GiftStrip() {
  return (
    <div className="lg:flex hidden min-h-[74px]  flex-col justify-center gap-2 overflow-hidden border-t border-black/40 bg-[#282828] px-[12px] py-2 sm:h-[74px] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-0 xl:h-[74px]">
      <div className="flex flex-wrap items-center gap-x-[14px] gap-y-2 text-[13px] text-[#cfcfcf] sm:text-[14px] 2xl:gap-[28px]">
        <span>
          💎 Kim cương: <b className="text-[#e64cff]">8888</b>
        </span>
        <span>
          🪙 Win coin: <b className="text-[#ff8c13]">8888</b>
        </span>
        <button className="h-[34px] rounded-[4px] bg-[#ff8c13] px-[12px] text-[13px] font-bold text-white sm:h-[38px] sm:px-[14px] sm:text-[14px] 2xl:px-[18px]">
          ✚ Nạp kim cương
        </button>
      </div>
      <div className="flex min-w-0 shrink items-center justify-end gap-[6px] overflow-hidden sm:gap-[8px] 2xl:gap-[10px]">
        {["🪩", "🪩", "🪩", "🪩", "🪩", "🎁"].map((gift, index) => (
          <button
            key={index}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[8px] border border-white/35 bg-[#424242] text-[22px] sm:h-[46px] sm:w-[46px] sm:text-[24px] 2xl:h-[58px] 2xl:w-[58px] 2xl:text-[28px]"
          >
            {gift}
          </button>
        ))}
      </div>
    </div>
  );
}
