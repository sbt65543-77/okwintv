import Image from "next/image";
import Link from "next/link";

export default function OkwinLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link aria-label="Về trang chủ" className="inline-flex cursor-pointer" href="/">
      <Image
        src="/assets/logo.png"
        alt="OKwinTV"
        width={234}
        height={40}
        priority={!compact}
        className="h-auto w-auto select-none"
        style={{
          height: compact ? 24.78654670715332 : 40,
          width: compact ? 145 : 233.60208129882812,
        }}
      />
    </Link>
  );
}
