export function PromoCard() {
  return (
    <article className="cursor-pointer h-[170px] rounded-[4px] border border-[#4a4a4a] bg-[linear-gradient(180deg,#fff34a_0,#ff8014_40%,#e51724_100%)] p-3 2xl:h-[184px]">
      <div className="mb-1 w-fit rounded bg-[#07a857] px-2 text-[11px] font-bold">
        Đang diễn ra
      </div>
      <div className="text-center text-[22px] font-black uppercase italic leading-none text-white drop-shadow 2xl:text-[26px]">
        Tiền nạp mỗi ngày
        <br />
        lợi ích nhân đôi
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {["+8%", "+10%", "+15%"].map((value) => (
          <div
            key={value}
            className="rounded bg-white/20 py-2 text-[22px] font-black 2xl:text-[28px]"
          >
            {value}
          </div>
        ))}
      </div>
    </article>
  );
}
