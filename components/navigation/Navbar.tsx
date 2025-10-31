"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/", label: "หน้าแรก" },
  { href: "/services", label: "บริการ" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/contact", label: "ติดต่อ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ปิดเมนูมือถือเมื่อเปลี่ยนหน้า
  useEffect(() => { setOpen(false); }, [pathname]);

  const base = "stricky top-0 z-50 w-full transition-all duration-200 backdrop-blur";
  const bg = atTop ? "bg-white/50" : "bg-white/90 border-b";
  return (
    <header className={`${base} ${bg}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo + Brand */}
        <Link href="/" className="flex items-center gap-2">
          {/* เปลี่ยนโลโก้ได้: ใส่ไฟล์ที่ /public/logo.png */}
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-200">
            <Image src="/mahidol.png" alt="logo" fill className="object-cover" sizes="40px" />
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-200">
            <Image src="/sportmed.png" alt="logo" fill className="object-cover" sizes="40px" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Sports Medicine &</div>
            <div className="text-sm -mt-0.5 font-semibold">Performance Center</div>
          </div>
        </Link>

        {/* Center: nav (desktop) */}
        <nav className="hidden gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-xl px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/sign-in"
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            สร้างบัญชี
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center rounded-xl border px-3 py-2 md:hidden"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          <span className="i">☰</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex flex-col gap-2">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-xl px-3 py-2 text-sm font-medium",
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 flex gap-2">
                <Link
                  href="/sign-in"
                  className="flex-1 rounded-xl border px-4 py-2 text-center text-sm font-medium hover:bg-slate-50"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/sign-up"
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                  สร้างบัญชี
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
