import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { email: "asc" }});
  return <pre>{JSON.stringify(users, null, 2)}</pre>;
}
