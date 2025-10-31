import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export default async function StaffQueuePage() {
  const user = await getCurrentUser();
  requireRole(user, ["staff", "admin"]);

  // ดึงคิวเฉพาะคลินิกของ user ถ้าต้องการ data scoping
  return <div>คิวผู้ป่วยวันนี้</div>;
}
