import "./globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext"; // Import เข้ามา
import RoleBasedLayout from "@/components/navigation/layout/RoleBasedLayout"; // <-- Import เข้ามา
import Navbar from "@/components/navigation/Navbar";

export const metadata = { title: "Sports Medicine & Performance Center" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <AuthProvider>

          <RoleBasedLayout>
            <div className="pt-0">{children}</div>  
          </RoleBasedLayout>
          
        </AuthProvider>
      </body>
    </html>
  );
}
