// src/contexts/AuthContext.tsx
"use client"; // <--- สำคัญมาก! เพราะ Context ทำงานฝั่ง Client

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import ที่เพิ่งติดตั้ง
import { Role } from '@prisma/client'; // Import Role จาก Prisma

// 1. กำหนดหน้าตาข้อมูล User ของเรา
interface AuthUser {
  userId: number;
  role: Role;
}

// 2. กำหนดหน้าตาของ Context
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

// 3. สร้าง Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. สร้าง "Provider" (ตัวหุ้มแอป)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // กันหน้ากระพริบตอนโหลด

  // 5. [สำคัญ] เช็ค Token ที่ค้างใน localStorage ตอนเปิดแอป
  useEffect(() => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<AuthUser>(storedToken);
        setUser({ userId: decoded.userId, role: decoded.role });
        setToken(storedToken);
      } catch (e) {
        // Token พัง/หมดอายุ
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  // 6. ฟังก์ชันสำหรับ Login
  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<AuthUser>(newToken);
      setUser({ userId: decoded.userId, role: decoded.role });
      setToken(newToken);
      localStorage.setItem('token', newToken); // เก็บ Token ไว้
    } catch (e) {
      console.error("Invalid token format");
    }
  };

  // 7. ฟังก์ชันสำหรับ Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    // อาจจะต้อง redirect ไปหน้า login
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 8. สร้าง Hook (ทางลัด) ให้เรียกใช้ง่ายๆ
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};