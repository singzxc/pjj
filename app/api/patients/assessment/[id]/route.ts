import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
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

// ---------------------------------------------
// ฟังก์ชัน GET (สำหรับโหลดหน้า)
// ---------------------------------------------
export async function GET(req: Request) {
  try {
    // 1. ตรวจสอบผู้ใช้
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const userId = await getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    // 2. (วิธีแก้) ดึง ID จาก req.url
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const idString = pathParts[pathParts.length - 1]; // เอาส่วนสุดท้าย (ID)
    const assessmentId = Number(idString);

    if (isNaN(assessmentId)) {
      return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
    }

    // 3. ค้นหา Assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId, patientId: userId },
    });
    if (!assessment) return NextResponse.json({ message: 'Assessment not found' }, { status: 404 });

    return NextResponse.json(assessment, { status: 200 });

  } catch (error) {
    console.error(`API GET /api/patients/assessment/[id] Error:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------
// ฟังก์ชัน PUT (สำหรับบันทึกฟอร์ม)
// (นี่คือส่วนที่คุณขาดไปใน Cache)
// ---------------------------------------------
export async function PUT(req: Request) {
  try {
    // 1. ตรวจสอบผู้ใช้
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const userId = await getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    // 2. (วิธีแก้) ดึง ID จาก req.url
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const idString = pathParts[pathParts.length - 1];
    const assessmentId = Number(idString);

    if (isNaN(assessmentId)) return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });

    // 3. รับ "คำตอบ" (answers) จาก body
    const answers = await req.json();

    // 4. อัปเดตฐานข้อมูล
    const updatedAssessment = await prisma.assessment.updateMany({
      where: { id: assessmentId, patientId: userId },
      data: {
        score: answers,
        status: "COMPLETED",
      },
    });
    
    if (updatedAssessment.count === 0) {
      return NextResponse.json({ message: 'Assessment not found or forbidden' }, { status: 404 });
    }

    return NextResponse.json(updatedAssessment, { status: 200 });

  } catch (error) {
    console.error(`API PUT /api/patients/assessment/[id] Error:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

