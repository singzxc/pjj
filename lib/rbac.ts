import { type Role } from "./auth";

export function requireRole(user: {role: Role} | null, allowed: Role[]) {
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!allowed.includes(user.role)) throw new Error("FORBIDDEN");
}

export const can = {
  viewPatient: (u: {role: Role} | null) => !!u && (u.role === "staff" || u.role === "admin"),
  exportData: (u: {role: Role} | null) => !!u && (u.role === "research" || u.role === "admin"),
  manageUsers: (u: {role: Role} | null) => !!u && u.role === "admin",
};
