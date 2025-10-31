import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const user = await getCurrentUser();
  try {
    requireRole(user, ["admin"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  // return list users
  return NextResponse.json({ users: [] });
}
