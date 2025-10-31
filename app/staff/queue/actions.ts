"use server";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export async function closeVisit(visitId: string) {
  const user = await getCurrentUser();
  requireRole(user, ["staff", "admin"]);

  // TODO: update prisma visit where clinicId = user.clinicId ...
  return { ok: true };
}
