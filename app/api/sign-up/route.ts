// app/api/sign-up/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Prisma ใช้กับ Node runtime เท่านั้น
export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      username, password, nameTh,
      email = null, nameEn = null, gender = null,
      nationality = null, religion = null, ethnicity = null,
      dob = null, phone = null,
    } = body ?? {};

    if (!username || !password || !nameTh) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashed,
        email,
        nameTh,
        nameEn,
        gender,
        nationality,
        religion,
        ethnicity,
        dob,
        phone,
      },
      select: { id: true, username: true },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (e: any) {
    // ถ้า unique constraint ซ้ำ (เช่น username/email)
    if (e?.code === "P2002") {
      return NextResponse.json({ message: "มีข้อมูลซ้ำ (อาจเป็นชื่อผู้ใช้หรืออีเมล)" }, { status: 409 });
    }
    console.error("SIGN-UP ERROR:", e);
    return NextResponse.json({ message: "เซิร์ฟเวอร์ขัดข้อง" }, { status: 500 });
  }
}