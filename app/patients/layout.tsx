// app/patient/layout.tsx (โค้ดที่ถูกต้อง)
import React from 'react';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  
  // Layout นี้ไม่จำเป็นต้องทำอะไรเลย
  // เพราะ RoleBasedLayout (ที่ app/layout.tsx) จัดการ Sidebar ให้แล้ว
  
  return <>{children}</>;
}