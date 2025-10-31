import { NextResponse } from 'next/server'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const prisma = new PrismaClient()

type Body = {
  username?: string
  email?: string
  id?: number | string
  password?: string
}

// 3. (แก้ไข) อัปเดตฟังก์ชัน createToken
async function createToken(
  userId: number,
  role: Role,
  username: string, // <-- เพิ่ม 1
  nameTh: string    // <-- เพิ่ม 2
) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }
  
  // 3.1 (แก้ไข) เพิ่ม username และ nameTh ลงใน Token
  const token = await new SignJWT({ 
      userId, 
      role, 
      username, // <-- เพิ่ม 3
      nameTh      // <-- เพิ่ม 4
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // หมดอายุใน 1 วัน
    .sign(secret)
    
  return token
}


export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body

    // ... (โค้ดส่วนค้นหา identifier และ password ของคุณถูกต้องแล้ว) ...
    const password = body.password?.trim() ?? ''
    const identifier =
      body.username?.trim() ??
      body.email?.trim() ??
      (typeof body.id === 'number'
        ? String(body.id)
        : typeof body.id === 'string'
          ? body.id.trim()
          : '')

    if (!identifier || !password) {
      return NextResponse.json({ message: 'กรอกข้อมูลไม่ครบ' }, { status: 400 })
    }

    // ... (โค้ดส่วน find user ของคุณถูกต้องแล้ว) ...
    let user = null
    if (/^\d+$/.test(identifier)) {
      user = await prisma.user.findUnique({ where: { id: Number(identifier) } })
    }
    if (!user) {
      user = await prisma.user.findUnique({ where: { username: identifier } })
    }
    if (!user && identifier.includes('@')) {
      user = await prisma.user.findUnique({ where: { email: identifier } })
    }

    if (!user) {
      return NextResponse.json({ message: 'invalid credentials' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return NextResponse.json({ message: 'invalid credentials' }, { status: 401 })
    }

    // --- 4. (สำคัญ!) อัปเดตตอนเรียก createToken ---
    
    // สร้าง Token
    const token = await createToken(
      user.id,
      user.role,
      user.username, // <-- ส่ง username
      user.nameTh    // <-- ส่ง nameTh
    );

    // ส่ง Token กลับไป (แทนที่จะส่ง user object)
    return NextResponse.json({ token: token }, { status: 200 });

    // --- จบส่วนแก้ไข ---

  } catch (err) {
    console.error('SIGN-IN ERROR:', err)
    return NextResponse.json({ message: 'เซิร์ฟเวอร์ขัดข้อง' }, { status: 500 })
  }
}
