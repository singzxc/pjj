import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// สมมุติคุณอ่าน role จาก cookie หรือ session token
function getRole(req: NextRequest): string | null {
  const r = req.cookies.get("role")?.value ?? null;
  return r;
}

export function middleware(req: NextRequest) {
  
  const { pathname } = req.nextUrl;
  const role = getRole(req); // แทนที่ด้วย NextAuth middleware ก็ได้

  // ต้องล็อกอินก่อน
  const protectedRoots = ["/patients", "/staff", "/research", "/admin"];
  if (protectedRoots.some(p => pathname.startsWith(p)) && !role) {
    const url = new URL("/sign-in", req.url);
    return NextResponse.redirect(url);
  }

  // แม็พเส้นทาง → role ที่อนุญาต
  const rules: Array<[prefix: string, allowed: string[]]> = [
    ["/patients", ["patient", "admin"]],
    ["/staff", ["staff", "admin"]],
    ["/research", ["research", "admin"]],
    ["/admin", ["admin"]],
  ];
  for (const [prefix, allowed] of rules) {
    if (pathname.startsWith(prefix) && role && !allowed.includes(role)) {
      return NextResponse.rewrite(new URL("/403", req.url)); // ทำหน้า 403 ของคุณ
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api/auth/mock|_next/static|_next/image|favicon.ico).*)',
};
