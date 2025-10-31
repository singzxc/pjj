// lib/auth.ts
import "server-only";
import { cookies as nextCookies } from "next/headers";

export type Role = "patient" | "staff" | "research" | "admin";

export type SessionUser =
  | {
      id: string;
      role: Role;
      clinicId?: string;
      orgId?: string;
    }
  | null;

/** อ่านผู้ใช้ปัจจุบันจากคุกกี้ (รองรับทั้งเคสที่มี/ไม่มี .get()) */
export function getCurrentUser(): SessionUser {
  try {
    const store: any = nextCookies();

    // 1) ปกติ: มี .get()
    if (typeof store.get === "function") {
      const role = store.get("role")?.value as Role | undefined;
      const uid = store.get("uid")?.value || "mock";
      return role ? { id: uid, role } : null;
    }

    // 2) บางเคสจะมีแค่ .getAll()
    if (typeof store.getAll === "function") {
      const map = new Map<string, string>(
        store.getAll().map((c: any) => [c.name, c.value])
      );
      const role = map.get("role") as Role | undefined;
      const uid = map.get("uid") || "mock";
      return role ? { id: uid, role } : null;
    }
  } catch {
    // ignore แล้วคืน null ด้านล่าง
  }

  return null;
}
