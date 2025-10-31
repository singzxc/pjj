"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext"; // <-- 1. Import useAuth
import { jwtDecode } from "jwt-decode"; // <-- 2. Import jwtDecode
import { Role } from "@prisma/client"; // <-- 3. Import Role (สำหรับ Map)

// 4. สร้าง Interface สำหรับข้อมูลใน Token
interface TokenPayload {
  userId: number;
  role: Role;
}

export default function SignInPage() {
  const router = useRouter();
  const auth = useAuth(); // <-- 5. เรียกใช้ auth
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    const f = new FormData(e.currentTarget);
    const id = String(f.get("id") || "").trim(); // (เปลี่ยน 'id' ให้ตรงกับ API ที่รับ 'username')
    const password = String(f.get("password") || "");

    if (!id || !password) {
      setErr("กรุณากรอกไอดี/อีเมล และรหัสผ่าน");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include", // ไม่จำเป็นถ้าใช้ Bearer Token
        body: JSON.stringify({ username: id, password }), // <-- ส่งเป็น username/id
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error((data && (data.message as string)) || "ไอดีหรือรหัสผ่านไม่ถูกต้อง");
      }

      // --- 6. (สำคัญ!) แก้ไข Logic ตรงนี้ทั้งหมด ---
      
      const { token } = data; // 6.1 API คืนค่า { token: "..." }
      if (!token) {
        throw new Error("Login failed: No token received.");
      }

      // 6.2 สั่งให้ AuthContext อัปเดต State และเก็บ Token!!
      auth.login(token);

      // 6.3 ถอดรหัส Token เพื่อดู Role และ Redirect
      const decoded = jwtDecode<TokenPayload>(token);
      const role = decoded.role;

      // 6.4 ใช้ Map เดิมของคุณ (แต่ใช้ Enum เพื่อความปลอดภัย)
      const map: Record<string, string> = {
        [Role.PATIENT]: "/patient/dashboard",
        [Role.MEDICAL_STAFF]: "/staff/queue",
        [Role.RESEARCHER]: "/research/studies",
        [Role.ADMIN]: "/admin/users",
      };
      const dest = role ? map[role] ?? "/" : "/";

      // 6.5 สั่งย้ายหน้า (ใช้ push ดีกว่า replace+refresh)
      router.push(dest);

      // --- จบส่วนแก้ไข ---

    } catch (error: any) {
      setErr(error?.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-lg">
        <div className="mb-4">
        
          <Link href="/" className="inline-flex items-center gap-0 text-slate-600 hover:text-slate-900">
            <span className="text-xl">←</span>
            <span className="text-sm">กลับหน้าแรก</span>
          </Link>
        </div>

        <h1 className="mb-6  text-center text-3xl font-extrabold tracking-tight">เข้าสู่ระบบ</h1>

        <div className="mb-8 flex items-center justify-center gap-0">
          <div className="relative h-70 w-100">
            <Image
              src="/loginlogo.png"
              alt="logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 80vw, 320px"
            />
          </div>
        </div>

        <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-5">
          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <div>
            <label htmlFor="id" className="mb-1 block text-sm font-medium text-slate-700">
              อีเมล หรือ ไอดี
            </label>
            <input
              id="id"
              name="id"
              type="text"
              inputMode="email"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              placeholder="your@email.com หรือ user123"
              aria-invalid={!!err}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-12 text-sm outline-none ring-blue-500 focus:ring-2"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPw ? "ซ่อน" : "แสดง"}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-xs text-slate-600 underline hover:text-slate-900">
                ลืมรหัสผ่าน?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          <div className="text-center text-sm text-slate-600">
            หากยังไม่มีบัญชี
            <Link href="/sign-up" className="font-semibold text-blue-700 hover:underline">
              สร้างบัญชีใหม่
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
