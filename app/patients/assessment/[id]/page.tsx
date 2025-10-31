"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Assessment } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library'; // Import Type นี้

// 1. Interface สำหรับเก็บคำตอบ (ครบทุกข้อ)
interface IkdcAnswers {
  q1: number | null;
  q2: number;
  q3: number;
  q4: number | null;
  q5: number | null;
  q6: number | null;
  q7: number | null;
  q8: number | null;
  q9a: number | null;
  q9b: number | null;
  q9c: number | null;
  q9d: number | null;
  q9e: number | null;
  q9f: number | null;
  q9g: number | null;
  q9h: number | null;
  q9i: number | null;
  q10a: number;
  q10b: number;
}

// 2. State เริ่มต้น (ครบทุกข้อ)
const initialState: IkdcAnswers = {
  q1: null, q2: 0, q3: 0, q4: null, q5: null, q6: null, q7: null, q8: null,
  q9a: null, q9b: null, q9c: null, q9d: null, q9e: null, q9f: null,
  q9g: null, q9h: null, q9i: null, q10a: 0, q10b: 0,
};

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<IkdcAnswers>(initialState);
  
  // --- 📍 3. State ใหม่สำหรับ "อ่านอย่างเดียว" ---
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const id = params.id as string;

  // 4. (Fetch ข้อมูล) - แก้ไข useEffect
  useEffect(() => {
    const fetchAssessment = async () => {
      if (id && token) {
        setLoading(true);
        try {
          const res = await fetch(`/api/patients/assessment/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch assessment data');
          const data: Assessment = await res.json();
          setAssessment(data);

          // --- 📍 5. ตรวจสอบข้อมูลที่บันทึกไว้ ---
          if (data.score && typeof data.score === 'object') {
            // ถ้ามี 'score' (Json) ให้ใช้ข้อมูลนั้นตั้งค่า State
            // และตรวจสอบ 'status' เพื่อตั้งค่า ReadOnly
            setAnswers(data.score as IkdcAnswers);
            if (data.status === "COMPLETED") {
              setIsReadOnly(true);
            }
          }
          // (ถ้าไม่มี 'score' หรือ status เป็น 'PENDING', 
          // 'answers' จะยังเป็น 'initialState' (ฟอร์มเปล่า)
          // 'isReadOnly' จะเป็น 'false' (กรอกได้))

        } catch (err: any) { setError(err.message); } 
        finally { setLoading(false); }
      }
    };
    fetchAssessment();
  }, [id, token]);

  // ฟังก์ชันสำหรับอัปเดต State (เช็ค ReadOnly)
  const handleAnswerChange = (key: keyof IkdcAnswers, value: number | null) => {
    if (isReadOnly) return; // <-- ถ้า ReadOnly, ห้ามเปลี่ยนค่า
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  // ฟังก์ชันสำหรับ "บันทึก" (Submit) - (เหมือนเดิม)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return; // ถ้า ReadOnly, ห้าม Submit

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/patients/assessment/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error("Failed to save assessment");
      alert("บันทึกแบบประเมินสำเร็จ!");
      router.push('/patients/records');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading assessment...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!assessment) return <div>Assessment not found.</div>;

  return (
    <div className="p-4 md:p-8 bg-white max-w-4xl mx-auto border-x border-gray-100">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">แบบบันทึกข้อมูลสุขภาพ</h1>
      <h2 className="text-xl font-semibold text-blue-800 mb-2">
        แบบประเมินอาการ {assessment.injuryArea} (IKDC)
      </h2>
      <p className="text-sm text-gray-500 mb-8">
        อ้างอิง: International Knee Documentation Committee (IKDC) Subjective Knee Evaluation
      </p>

      {/* --- 📍 6. หุ้มฟอร์มด้วย fieldset และใส่ 'disabled' --- */}
      <form onSubmit={handleSubmit} className="space-y-10">
        <fieldset disabled={isReadOnly} className="space-y-10"> {/* <-- 7. ปิดการใช้งานถ้า ReadOnly */}

          {/* === Q1 === */}
          <QuestionBlock title="1. คุณสามารถทำกิจกรรมในระดับสูงสุดได้โดยไม่เกิดอาการปวดอย่างรุนแรง?">
            <ClickableRowOption value={4} name="q1" label="กิจกรรมที่ต้องออกแรงมาก..." selectedValue={answers.q1} onClick={() => handleAnswerChange('q1', 4)} />
            <ClickableRowOption value={3} name="q1" label="กิจกรรมที่ต้องออกแรงมาก..." selectedValue={answers.q1} onClick={() => handleAnswerChange('q1', 3)} />
            <ClickableRowOption value={2} name="q1" label="กิจกรรมปานกลาง..." selectedValue={answers.q1} onClick={() => handleAnswerChange('q1', 2)} />
            <ClickableRowOption value={1} name="q1" label="กิจกรรมเบาๆ..." selectedValue={answers.q1} onClick={() => handleAnswerChange('q1', 1)} />
            <ClickableRowOption value={0} name="q1" label="ไม่สามารถทำกิจกรรมใดๆ..." selectedValue={answers.q1} onClick={() => handleAnswerChange('q1', 0)} />
          </QuestionBlock>

          {/* === Q2 === */}
          <QuestionBlock title="2. ...คุณมีอาการปวดบ่อยเพียงใด?">
            <ScaleInput value={answers.q2} onChange={(v) => handleAnswerChange('q2', v)} minLabel="ไม่เลย" maxLabel="ปวดตลอดเวลา" />
          </QuestionBlock>

          {/* === Q3 === */}
          <QuestionBlock title="3. ...อาการปวดจะรุนแรงแค่ไหน?">
            <ScaleInput value={answers.q3} onChange={(v) => handleAnswerChange('q3', v)} minLabel="ไม่มีความเจ็บปวด" maxLabel="ปวดรุนแรงมาก" />
          </QuestionBlock>
          
          {/* === Q4 === */}
          <QuestionBlock title="4. ...ฝ่ายของเข่าคุณบวมแค่ไหน?">
            <ButtonToggleGroup
              name="q4"
              value={answers.q4}
              onChange={(v) => handleAnswerChange('q4', v)}
              options={[
                { label: "ไม่มีเลย", value: 4 }, { label: "น้อย", value: 3 }, { label: "ปานกลาง", value: 2 },
                { label: "มาก", value: 1 }, { label: "มากที่สุด", value: 0 }
              ]}
            />
          </QuestionBlock>

          {/* === Q5 (เหมือน Q1) === */}
          <QuestionBlock title="5. คุณสามารถทำกิจกรรมในระดับสูงสุดได้โดยไม่ปวดเข่ามากนัก?">
            <ClickableRowOption value={4} name="q5" label="กิจกรรมที่ต้องออกแรงมาก..." selectedValue={answers.q5} onClick={() => handleAnswerChange('q5', 4)} />
            {/* ... (ใส่ตัวเลือกที่เหลือ) ... */}
            <ClickableRowOption value={0} name="q5" label="ไม่สามารถทำกิจกรรมใดๆ..." selectedValue={answers.q5} onClick={() => handleAnswerChange('q5', 0)} />
          </QuestionBlock>
          
          {/* === Q6 (Yes/No) === */}
          <QuestionBlock title="6. ...เข่าของคุณทรุดหรือติดขัดหรือไม่?">
            <YesNoToggle value={answers.q6} onChange={(v) => handleAnswerChange('q6', v)} />
          </QuestionBlock>

          {/* === Q7 (เหมือน Q1) === */}
          <QuestionBlock title="7. ระดับกิจกรรมสูงสุดที่คุณสามารถทำได้โดยไม่ทำให้เข่าทรุด...?">
            <ClickableRowOption value={4} name="q7" label="กิจกรรมที่ต้องออกแรงมาก..." selectedValue={answers.q7} onClick={() => handleAnswerChange('q7', 4)} />
            {/* ... (ใส่ตัวเลือกที่เหลือ) ... */}
            <ClickableRowOption value={0} name="q7" label="ไม่สามารถทำกิจกรรมใดๆ..." selectedValue={answers.q7} onClick={() => handleAnswerChange('q7', 0)} />
          </QuestionBlock>
          
          {/* === Q8 (เหมือน Q1) === */}
          <QuestionBlock title="8. ระดับกิจกรรมสูงสุดที่คุณสามารถทำได้โดยไม่ทำให้เข่าทรุด...?">
            <ClickableRowOption value={4} name="q8" label="กิจกรรมที่ต้องออกแรงมาก..." selectedValue={answers.q8} onClick={() => handleAnswerChange('q8', 4)} />
            {/* ... (ใส่ตัวเลือกที่เหลือ) ... */}
            <ClickableRowOption value={0} name="q8" label="ไม่สามารถทำกิจกรรมใดๆ..." selectedValue={answers.q8} onClick={() => handleAnswerChange('q8', 0)} />
          </QuestionBlock>

          {/* === Q9 (Matrix) === */}
          <QuestionBlock title="9. ฝ่ายของขาคุณส่งผลต่อความสามารถของคุณในการ:">
            <MatrixRow label="ก. ขึ้นบันได" name="q9a" value={answers.q9a} onChange={(v) => handleAnswerChange('q9a', v)} />
            <MatrixRow label="ข. ลงบันได" name="q9b" value={answers.q9b} onChange={(v) => handleAnswerChange('q9b', v)} />
            <MatrixRow label="ค. นั่งคุกเข่า" name="q9c" value={answers.q9c} onChange={(v) => handleAnswerChange('q9c', v)} />
            <MatrixRow label="ง. นั่งยองๆ" name="q9d" value={answers.q9d} onChange={(v) => handleAnswerChange('q9d', v)} />
            <MatrixRow label="จ. นั่งงอเข่า" name="q9e" value={answers.q9e} onChange={(v) => handleAnswerChange('q9e', v)} />
            <MatrixRow label="ฉ. ลุกจากเก้าอี้" name="q9f" value={answers.q9f} onChange={(v) => handleAnswerChange('q9f', v)} />
            <MatrixRow label="ช. วิ่งตรงไปข้างหน้า" name="q9g" value={answers.q9g} onChange={(v) => handleAnswerChange('q9g', v)} />
            <MatrixRow label="ซ. กระโดดและลงด้วยขาข้างเดียว" name="q9h" value={answers.q9h} onChange={(v) => handleAnswerChange('q9h', v)} />
            <MatrixRow label="ฌ. หยุดและหันตัวเร็ว" name="q9i" value={answers.q9i} onChange={(v) => handleAnswerChange('q9i', v)} />
          </QuestionBlock>

          {/* === Q10 === */}
          <QuestionBlock title="10. ... ให้คะแนนการทำงานของหัวเข่า...">
            <label className="font-semibold block mb-4">ก. การทำงานก่อนได้รับบาดเจ็บที่หัวเข่า:</label>
            <ScaleInput value={answers.q10a} onChange={(v) => handleAnswerChange('q10a', v)} />
            
            <label className="font-semibold block mt-8 mb-4">ข. การทำงานปัจจุบัน:</label>
            <ScaleInput value={answers.q10b} onChange={(v) => handleAnswerChange('q10b', v)} />
          </QuestionBlock>
          
        </fieldset> {/* <-- 7. ปิด fieldset */}


        {/* === 📍 8. ปุ่ม Submit/Back === */}
        <div className="text-center pt-8">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {/* ถ้ายังไม่เสร็จ (ReadOnly=false) ให้แสดงปุ่มบันทึก */}
          {!isReadOnly && (
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-800 text-white px-10 py-3 rounded-full shadow-lg hover:bg-blue-900 disabled:opacity-50 text-lg font-semibold"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          )}

          {/* ถ้าเสร็จแล้ว (ReadOnly=true) ให้แสดงปุ่มกลับ */}
          {isReadOnly && (
            <button
              type="button"
              onClick={() => router.push('/patients/records')} // <-- ปุ่มกลับ
              className="bg-gray-500 text-white px-10 py-3 rounded-full shadow-lg hover:bg-gray-600 text-lg font-semibold"
            >
              กลับไปหน้าประวัติ
            </button>
          )}
        </div>

      </form>
    </div>
  );
}

// --- (Components ย่อย - แก้ไขเล็กน้อย) ---

// (บล็อกคำถาม)
const QuestionBlock = ({ title, children }: { title: string, children: ReactNode }) => (
  <fieldset className="border border-gray-200 rounded-lg p-4 pt-2 shadow-sm bg-gray-50/50 disabled:bg-gray-100 disabled:opacity-80">
    <legend className="text-base font-semibold text-gray-800 px-2 bg-white">
      {title}
    </legend>
    <div className="space-y-3 pt-2">{children}</div>
  </fieldset>
);

// (ตัวเลือกแบบแถว Q1, 5, 7, 8)
const ClickableRowOption = ({ value, label, selectedValue, onClick, name }: { value: number, label: string, selectedValue: number | null, onClick: () => void, name: string }) => (
  <label className={`flex items-center p-3 rounded-md cursor-pointer border ${
    selectedValue === value
      ? 'bg-blue-700 border-blue-800 text-white shadow-md'
      : 'bg-white border-gray-300 hover:bg-gray-100'
  } disabled:opacity-70 disabled:hover:bg-white`}>
    <input 
      type="radio" 
      name={name} 
      value={value} 
      checked={selectedValue === value} 
      onChange={onClick} 
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50" 
    />
    <span className="ml-3 text-sm font-medium">{label} ({value})</span>
  </label>
);

// (แถบเลื่อน 0-10 Q2, 3, 10)
const ScaleInput = ({ value, onChange, minLabel = "Min", maxLabel = "Max" }: { value: number | null, onChange: (value: number) => void, minLabel?: string, maxLabel?: string }) => (
  <div className="px-2 pt-4 pb-2">
    <input
      type="range"
      min="0"
      max="10"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-blue-700 [&::-moz-range-thumb]:bg-blue-700 disabled:opacity-70 [&::-webkit-slider-thumb]:disabled:bg-gray-400"
    />
    <div className="flex justify-between text-xs text-gray-500 mt-2">
      <span>{minLabel} (0)</span>
      <span className="font-bold text-blue-800 text-xl">{value ?? 0}</span>
      <span>{maxLabel} (10)</span>
    </div>
  </div>
);

// (ปุ่มตัวเลือก Q4)
const ButtonToggleGroup = ({ name, value, onChange, options }: { name: string, value: number | null, onChange: (val: number) => void, options: { label: string, value: number }[] }) => (
  <div className="flex flex-wrap gap-3 p-2 justify-center">
    {options.map(opt => (
      <button
        type="button"
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`px-5 py-2 rounded-full text-sm font-semibold border
          ${value === opt.value
            ? 'bg-blue-700 text-white border-blue-800 shadow-md'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          } disabled:opacity-70 disabled:hover:bg-white disabled:shadow-none`}
      >
        {opt.label} ({opt.value})
      </button>
    ))}
  </div>
);

// (ปุ่ม Yes/No Q6)
const YesNoToggle = ({ value, onChange }: { value: number | null, onChange: (val: number) => void }) => (
  <div className="flex gap-4 justify-center p-2">
    <button
      type="button"
      onClick={() => onChange(1)}
      className={`px-8 py-2 rounded-full text-sm font-semibold border ${
        value === 1 ? 'bg-blue-700 text-white border-blue-800 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
      } disabled:opacity-70 disabled:hover:bg-white disabled:shadow-none`}
    >
      ✓ ใช่ (1)
    </button>
    <button
      type="button"
      onClick={() => onChange(0)}
      className={`px-8 py-2 rounded-full text-sm font-semibold border ${
        value === 0 ? 'bg-blue-700 text-white border-blue-800 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
      } disabled:opacity-70 disabled:hover:bg-white disabled:shadow-none`}
    >
      ✗ ไม่ (0)
    </button>
  </div>
);

// (แถว Matrix Q9)
const MatrixRow = ({ label, value, onChange, name }: { label: string, value: number | null, onChange: (val: number) => void, name: string }) => (
  <div className="border-t py-4 px-2 last-of-type:border-b">
    <p className="font-semibold mb-3 text-gray-800">{label}</p>
    <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center">
      {(["ไม่มีเลย (4)", "เล็กน้อย (3)", "ปานกลาง (2)", "มาก (1)", "มากที่สุด (0)"]).map((text, i) => {
        const val = 4 - i;
        return (
          <label key={val} className="flex items-center space-x-2 cursor-pointer disabled:opacity-70">
            <input 
              type="radio" 
              name={name} 
              value={val} 
              checked={value === val} 
              onChange={() => onChange(val)} 
              className="h-4 w-4 text-blue-600 disabled:opacity-50" 
            />
            <span className="text-sm text-gray-700">{text}</span>
          </label>
        );
      })}
    </div>
  </div>
);
