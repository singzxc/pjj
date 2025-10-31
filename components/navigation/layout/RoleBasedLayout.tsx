// src/components/layout/RoleBasedLayout.tsx
"use client"; // <-- สำคัญมาก!

import { useAuth } from "@/app/contexts/AuthContext";
import { Role } from "@prisma/client";
import { ReactNode } from "react";

// Import Navbar/Sidebar ทั้งหมดของคุณ
import Navbar from "@/components/navigation/Navbar"; // Navbar สาธารณะ / Default
import PatientSidebar from "@/components/navigation/PatientSidebar";
// import AdminSidebar from "@/components/navigation/AdminSidebar.tsx"; // สมมติว่ามี
// import MedicalStaffLayout from "@/components/navigation/MedicalStaffLayout.tsx"; // สมมติว่ามี

export default function RoleBasedLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  console.log("RoleBasedLayout Check:", { user, isLoading });
  // 1. ระหว่างรอโหลดข้อมูลผู้ใช้ (กันหน้ากระพริบ)
  if (isLoading) {
    return <div>Loading navigation...</div>; // หรือแสดง UI โครงกระดูก (Skeleton)
  }
  console.log("RoleBasedLayout: Render decision for user:", user?.role);
  // 2. ฟังก์ชันสำหรับเลือก Layout
  const getLayout = () => {
    // 3. ใช้ switch ตาม Role ของผู้ใช้
    switch (user?.role) {
      case Role.PATIENT:
        // ถ้าเป็น PATIENT ให้ใช้ PatientSidebar
        // (โครงสร้างนี้สมมติว่า Sidebar อยู่ด้านซ้าย และเนื้อหา (children) อยู่ด้านขวา)
        return (
          <div className="flex">
            <PatientSidebar />
            <main className="flex-1 p-4">{children}</main>
          </div>
        );

      // case Role.ADMIN:
      //   return (
      //     <div className="flex">
      //       <AdminSidebar />
      //       <main className="flex-1 p-4">{children}</main>
      //     </div>
      //   );

      // case Role.MEDICAL_STAFF:
      //   return (
      //     <MedicalStaffLayout>
      //       {children}
      //     </MedicalStaffLayout>
      //   );

      // 4. (Default) ถ้ายังไม่ Login หรือไม่มี Role ที่ตรงกัน
      default:
        console.log("RoleBasedLayout: Rendering DEFAULT layout"); // <-- เช็คว่าเข้า Case นี้ไหม
        // ให้ใช้ Navbar.tsx (Navbar สาธารณะ)
        return (
          <div>
            <Navbar />
            <main className="p-4">{children}</main>
          </div>
        );
    }
  };

  // 5. คืนค่า Layout ที่เลือกแล้ว
  return getLayout();
}