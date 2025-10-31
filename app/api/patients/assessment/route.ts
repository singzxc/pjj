import { NextResponse } from 'next/server'
import { PrismaClient, Assessment } from '@prisma/client'
import { jwtVerify } from 'jose'

const prisma = new PrismaClient()

// (Helper ดึง userId จาก Token)
async function getUserIdFromToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify<{ userId: number }>(token, secret)
    return payload.userId
  } catch (e) {
    return null
  }
}

// (Logic เลือกแบบประเมิน - คุณต้องกำหนดเอง)
function getFormTypeForArea(area: string): string {
  if (area === "ข้อเข่า") return "IKDC";
  if (area === "ข้อไหล่") return "DASH";
  // ... (Logic อื่นๆ) ...
  return "GENERAL";
}

// ---------------------------------------------
// ฟังก์ชัน GET (สำหรับดึงประวัติทั้งหมด)
// (นี่คือส่วนที่ Server ของคุณหาไม่เจอ)
// ---------------------------------------------
export async function GET(req: Request) {
  try {
    // 1. ตรวจสอบผู้ใช้
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const userId = await getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    // 2. ดึงประวัติ Assessment ทั้งหมดของ User คนนี้
    const assessments = await prisma.assessment.findMany({
      where: {
        patientId: userId,
      },
      orderBy: {
        createdAt: 'desc', // เรียงจากใหม่ไปเก่า
      }
    });

    // 3. ส่งข้อมูลกลับไป
    return NextResponse.json(assessments, { status: 200 });

  } catch (error) {
    console.error('API GET /api/patients/assessment Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------
// ฟังก์ชัน POST (สำหรับสร้าง Assessment ใหม่)
// (ส่วนนี้ของคุณน่าจะทำงานถูกแล้ว แต่ต้องมีในไฟล์เดียวกัน)
// ---------------------------------------------
export async function POST(req: Request) {
  try {
    // 1. ตรวจสอบผู้ใช้
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const userId = await getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    // 2. รับข้อมูลที่ส่งมา (injuryArea, painScore)
    const body = await req.json();
    const { injuryArea, painScore } = body; 

    if (!injuryArea) {
      return NextResponse.json({ message: 'Missing injury area' }, { status: 400 });
    }

    // 3. (Logic ของคุณ) ตัดสินใจว่าจะใช้ฟอร์มไหน
    const formType = getFormTypeForArea(injuryArea);

    // 4. สร้างการประเมินใหม่ในฐานข้อมูล
    const newAssessment = await prisma.assessment.create({
      data: {
        patientId: userId,
        injuryArea: injuryArea,
        formType: formType,
        status: "PENDING", 
        painScore: painScore ? Number(painScore) : null,
      }
    });

    // 5. ส่ง ID ของการประเมินใหม่กลับไป
    return NextResponse.json(newAssessment, { status: 201 });

  } catch (error) {
    console.error('API POST /api/patients/assessment Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

