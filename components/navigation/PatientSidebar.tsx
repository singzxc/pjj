"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '@/app/contexts/AuthContext'; // <--- 2. IMPORT THIS
import { Role } from '@prisma/client';

const items = [
  { href: "/patients/dashboard", label: "หน้าแรก", icon: "🏠" },
  { href: "/patients/records", label: "บันทึกข้อมูลสุขภาพ", icon: "📝" },
  { href: "/patients/workout", label: "แผนการออกกำลังกาย", icon: "📍" },
  { href: "/patients/reports", label: "แดชบอร์ด", icon: "📊" },
];

export default function PatientSidebar() {
  const pathname = usePathname();
  const { user, isLoading, logout} = useAuth(); // <--- ...WITH THIS  // Try to read role from session.user (supports string or enum-like)

  // Only show this navbar for PATIENT role (case-insensitive)
if (isLoading) {
    return (
      <aside className="w-64 bg-gray-100 p-4">
        {/* You can put a loading skeleton here */}
        <div>Loading...</div>
      </aside>
    );
  }
  
if (user?.role !== Role.PATIENT) {
    // This probably shouldn't happen, but good to have a fallback
    return null; 
  }
  return (
    <nav className="h-full rounded-2xl bg-[#0E2C66] p-4 text-white shadow">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/20" />
        <div className="text-sm leading-tight">
          <div className="font-semibold">Sports Medicine &</div>
          <div className="-mt-1 font-semibold">Performance Center</div>
        </div>
      </div>
      <ul className="space-y-1">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                  active ? "bg-white text-[#0E2C66]" : "hover:bg-white/10"
                }`}
              >
                <span>{it.icon}</span>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
  }
