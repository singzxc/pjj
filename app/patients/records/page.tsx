"use client";

import { useState, ChangeEvent, useEffect } from "react";
import DashboardCard from "@/components/DashboardCard";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Assessment, Role } from "@prisma/client";

// (Enum InjuryArea ของคุณ)
enum InjuryArea {
  KNEE = "ข้อเข่า",
  SHOULDER = "ข้อไหล่",
  ELBOW = "ข้อศอก",
  ANKLE = "ข้อเท้า",
  BACK = "หลัง",
  WRIST = "ข้อมือ",
  HIP = "ข้อสะโพก",
  OTHERS = "อื่นๆ"
}

// (ข้อมูล User Profile สมมติ)
const fakePatientData = {
  nameTh: "สมชาย ใจดี",
  age: 35,
  gender: "ชาย",
  hn: "HN15782",
  anamnesis: "ไม่มี",
  chiefComplaint: "ข้อเข่า",
};

export default function RecordHealthPage() {
  const { user, isLoading: isAuthLoading, token } = useAuth();
  const router = useRouter();

  const [selectedArea, setSelectedArea] = useState<InjuryArea | null>(null);
  const [painScore, setPainScore] = useState(0);
  const [files, setFiles] = useState<File[]>([]); // <-- State ที่เก็บไฟล์
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [results, setResults] = useState<Assessment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // (useEffect ... ดึงประวัติ ... เหมือนเดิม)
  useEffect(() => {
    const fetchHistory = async () => {
      if (user && token) {
        setHistoryLoading(true);
        try {
          const res = await fetch('/api/patients/assessment', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Failed to fetch assessment history");
          const data: Assessment[] = await res.json();
          setResults(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setHistoryLoading(false);
        }
      }
    };
    
    if (!isAuthLoading) {
      fetchHistory();
    }
  }, [user, token, isAuthLoading]);

  // (ป้องกันหน้า)
  if (isAuthLoading) return <div>Loading...</div>;
  if (!user) {
    router.push('/sign-in');
    return null;
  }

  // (ฟังก์ชัน handle... ต่างๆ ... เหมือนเดิม)
  const handleInjurySelect = (area: InjuryArea) => {
    setSelectedArea(area);
    setPainScore(0);
    setFiles([]);
    setError(null);
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  // --- 📍 (แก้ไข) ฟังก์ชัน "ทำแบบประเมิน" ---
  const handleStartAssessment = async () => {
    if (!selectedArea) return;

    setLoading(true);
    setError(null);
    let uploadedFileUrl: string | null = null; // 1. ตัวแปรเก็บ URL

    try {
      // --- 2. ขั้นตอนอัปโหลดไฟล์ (ถ้ามี) ---
      if (files.length > 0) {
        const file = files[0];
        // 2.1. เรียก API Upload ที่เราสร้างใหม่
        const uploadResponse = await fetch(
          `/api/upload?filename=${file.name}`,
          {
            method: 'POST',
            body: file, // 2.2. ส่ง 'File' ไปตรงๆ (ไม่ใช่ JSON)
          }
        );

        if (!uploadResponse.ok) throw new Error('Failed to upload file');
        
        const blob = await uploadResponse.json();
        uploadedFileUrl = blob.url; // 2.3. เก็บ URL ที่ได้
      }

      // --- 3. ขั้นตอนบันทึก Assessment (เหมือนเดิม แต่เพิ่ม fileUrl) ---
      const assessmentResponse = await fetch('/api/patients/assessment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          injuryArea: selectedArea,
          painScore: painScore,
          fileUrl: uploadedFileUrl // 3.1. ส่ง URL ที่อัปโหลดแล้วไปเก็บ
        }),
      });

      if (!assessmentResponse.ok) throw new Error("ไม่สามารถเริ่มการประเมินได้");
      
      const newAssessment = await assessmentResponse.json();
      router.push(`/patients/assessment/${newAssessment.id}`);

    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-4 md:p-8">
      {/* ... (ส่วนหัว, การ์ดข้อมูลส่วนตัว, การ์ดเลือกอาการ ... เหมือนเดิม) ... */}
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">แบบบันทึกข้อมูลสุขภาพ</h1>
        <button className="bg-blue-800 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-900">
          📞 ติดต่อคลินิก
        </button>
      </div>
      <DashboardCard title="" className="mb-6">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 bg-blue-200 border-4 border-white rounded-md flex-shrink-0 shadow-lg" />
          <div>
            <p><strong>ชื่อ-นามสกุล:</strong> {fakePatientData.nameTh} (อายุ: {fakePatientData.age} ปี) <strong>เพศ:</strong> {fakePatientData.gender}</p>
            <p><strong>HN:</strong> {fakePatientData.hn}</p>
            <p><strong>โรคประจำตัว:</strong> {fakePatientData.anamnesis}</p>
            <p><strong>ส่วนที่เจ็บ:</strong> {fakePatientData.chiefComplaint}</p>
          </div>
        </div>
      </DashboardCard>
      <DashboardCard title="อาการที่ได้รับการบาดเจ็บ" className="mb-6">
        <p className="text-gray-600 mb-4">เลือกเพื่อทำแบบประเมินอาการ</p>
        <div className="flex flex-wrap gap-3">
          {Object.values(InjuryArea).map((area) => (
            <button
              key={area}
              onClick={() => handleInjurySelect(area)}
              disabled={loading}
              className="bg-blue-800 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-900 disabled:opacity-50"
            >
              {area}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </DashboardCard>
      
      {/* --- 📍 แก้ไขส่วนตารางสรุปผล --- */}
      <DashboardCard title="สรุปผลการประเมิน" className="mb-6">
        <div className="overflow-x-auto overflow-y-auto max-h-96 border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            {/* <thead> ... เหมือนเดิม ... </thead> */}
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อาการ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แบบประเมิน</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คะแนน (Pain)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              </tr>
            </thead>
            
            {/* <tbody> ... เหมือนเดิม ... </tbody> */}
            <tbody className="bg-white divide-y divide-gray-200">
              {historyLoading ? (
                <tr><td colSpan={5} className="text-center p-4">Loading history...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-4 text-gray-500">ไม่พบประวัติการประเมิน</td></tr>
              ) : (
                results.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => router.push(`/patients/assessment/${item.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(item.createdAt).toLocaleDateString("th-TH")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.injuryArea}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.formType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.painScore ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status === 'COMPLETED' ? 'เสร็จสิ้น' : 'รอประเมิน'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* ... (ส่วน Conditional Rendering ... เหมือนเดิม) ... */}
      {selectedArea && (
        <DashboardCard title={selectedArea} className="mb-6">
          {/* ... (ส่วนอัปโหลดไฟล์) ... */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">อัปโหลดรูปภาพ หรือ วิดีโอ</p>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              className="hidden" 
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="mt-4 cursor-pointer bg-blue-800 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-900 text-sm"
            >
              อัปโหลด
            </label>
            <div className="mt-2 text-xs text-gray-500">
              {files.length > 0 ? files.map(f => f.name).join(', ') : 'ยังไม่ได้เลือกไฟล์'}
            </div>
          </div>
          {/* ... (ส่วน Pain Score) ... */}
          <div className="mb-6">
            <label htmlFor="painscore" className="block text-lg font-semibold text-gray-700 mb-4">Painscore</label>
            <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
              <span>ไม่ปวด</span>
              <span>ปวดมากที่สุด</span>
            </div>
            <input
              id="painscore"
              type="range"
              min="0"
              max="10"
              value={painScore}
              onChange={(e) => setPainScore(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs px-1 mt-1">
              {[...Array(11)].map((_, i) => (
                <span key={i} className="text-gray-500">{i}</span>
              ))}
            </div>
            <div className="text-center text-xl font-bold mt-4 text-blue-800">
              คะแนน: {painScore}
            </div>
          </div>
          {/* ... (ปุ่ม Submit) ... */}
          <div className="text-center">
            <button
              onClick={handleStartAssessment}
              disabled={loading}
              className="bg-blue-800 text-white px-8 py-3 rounded-full shadow-lg hover:bg-blue-900 disabled:opacity-50 text-lg font-semibold"
            >
              {loading ? "กำลังบันทึก..." : "ทำแบบประเมิน"}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </DashboardCard>
      )}

    </div>
  );
}

