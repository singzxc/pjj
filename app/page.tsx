import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/Main_gymbromyths.jpg"   // ไฟล์อยู่ที่ <root>/public/Main_gymbromyths.jpg
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/30 to-slate-900/70" />
      </div>

      {/* ส่วนเนื้อหา Hero */}
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-4 py-12">
        <div className="max-w-2xl text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            ดูแลสุขภาพแบบที่เหมาะกับคุณ
          </h1>
          <p className="mt-4 text-lg text-slate-100/90">
            เราจะช่วยคุณหาวิธีดูแลตัวเองที่ใช่ที่สุด เพื่อให้คุณแข็งแรงและมีความสุขทุกวัน
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              เริ่มต้นใช้งาน
            </Link>
            <Link
              href="/learn-more"
              className="rounded-xl border border-white/70 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              เรียนรู้เพิ่มเติม
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
