import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // 1. ตรวจสอบว่ามีชื่อไฟล์ส่งมาไหม
  if (!filename) {
    return NextResponse.json(
      { message: 'Missing filename' },
      { status: 400 },
    );
  }

  // 2. ตรวจสอบว่ามีไฟล์ส่งมาไหม
  if (!request.body) {
     return NextResponse.json(
      { message: 'Missing file body' },
      { status: 400 },
    );
  }

  try {
    // 3. อัปโหลดไฟล์ไปที่ Vercel Blob
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    // 4. ส่ง URL ที่ได้กลับไปให้ Frontend
    return NextResponse.json(blob, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: 'Error uploading file' },
      { status: 500 },
    );
  }
}
