// src/components/DashboardCard.tsx
import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // สำหรับใส่ col-span
}

export default function DashboardCard({ title, children, className = '' }: DashboardCardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        {title}
      </h2>
      <div>
        {children}
      </div>
    </div>
  );
}