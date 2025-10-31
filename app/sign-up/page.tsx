"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  username: z.string().min(3, "ไอดีต้องมีอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
  confirm: z.string(),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  nameTh: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล (ไทย)"),
  nameEn: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  ethnicity: z.string().optional(),
  dob: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+?\d{8,15}$/, "รูปแบบเบอร์ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
}).refine((v) => v.password === v.confirm, {
  message: "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
  path: ["confirm"],
});

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: undefined,
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setServerError(null);

    // อย่าส่ง confirm ไปที่เซิร์ฟเวอร์
    const { confirm, ...payload } = values as any;

    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "สมัครไม่สำเร็จ" }));
        throw new Error(data.message || "สมัครไม่สำเร็จ");
      }

      // สมัครสำเร็จ → ไปหน้า sign-in
      router.push("/sign-in?registered=1");
    } catch (err: any) {
      setServerError(err?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 text-slate-800 bg-white">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <span className="text-xl">←</span>
            <span className="text-sm">กลับหน้าแรก</span>
          </Link>
        </div>

        <h1 className="mb-6 text-center text-3xl font-extrabold">สมัครสมาชิก</h1>

        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="relative h-0 w-100">
            <Image
              src="/loginlogo.png"
              alt="logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 80vw, 320px"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid max-w-2xl gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อไอดี</label>
            <input
              {...register("username")}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              placeholder="user123"
            />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-12 text-sm outline-none ring-blue-500 focus:ring-2"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  {showPw ? "ซ่อน" : "แสดง"}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">รหัสผ่านอีกครั้ง</label>
              <div className="relative">
                <input
                  type={showPw2 ? "text" : "password"}
                  {...register("confirm")}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-12 text-sm outline-none ring-blue-500 focus:ring-2"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  {showPw2 ? "ซ่อน" : "แสดง"}
                </button>
              </div>
              {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">อีเมล</label>
            <input
              {...register("email")}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อ-นามสกุล (ไทย)</label>
            <input
              {...register("nameTh")}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              placeholder="สมชาย ใจดี"
            />
            {errors.nameTh && <p className="mt-1 text-xs text-red-600">{errors.nameTh.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อ-นามสกุล (ภาษาอังกฤษ)</label>
            <input
              {...register("nameEn")}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              placeholder="Somchai Jaidee"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium">เพศ</label>
              <select
                {...register("gender")}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                defaultValue=""
              >
                <option value="" disabled>
                  เลือก
                </option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่น ๆ</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">สัญชาติ</label>
              <input
                {...register("nationality")}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                placeholder="ไทย"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">ศาสนา</label>
              <input
                {...register("religion")}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                placeholder="พุทธ"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">เชื้อชาติ</label>
              <input
                {...register("ethnicity")}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                placeholder="ไทย"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">วัน/เดือน/ปีเกิด</label>
              <input
                type="date"
                {...register("dob")}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              />
            </div>
          <div>
            <label className="mb-1 block text-sm font-medium">เบอร์ติดต่อ</label>
            <input
              {...register("phone")}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              placeholder="08xxxxxxxx"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>

          <div className="text-center text-sm text-slate-600">
            หากมีบัญชีอยู่แล้ว{" "}
            <Link href="/sign-in" className="font-semibold text-blue-700 hover:underline">
              เข้าสู่ระบบ 
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
