import type { DepartmentId } from "./departments";

// Supabase hospitals 테이블 한 줄의 모양 (열 이름과 똑같아요)
// 화면 코드에서도 쓰는 파일이라 DB 연결 코드는 lib/data.ts에 따로 뒀어요.
export type Hospital = {
  id: number;
  name: string;
  department: DepartmentId;
  doctor_name: string;
  specialty: string;
  doctor_image: string;
  address: string;
  description: string;
  open_time: string; // "09:00"
  close_time: string; // "18:00"
  lunch_start: string | null;
  lunch_end: string | null;
  closed_days: number[]; // 쉬는 요일 (0=일, 1=월 … 6=토)
  rating: number;
  review_count: number;
};

// 저녁 8시 이후까지 진료하면 '야간 진료'
export function isNightCare(h: Hospital) {
  return h.close_time >= "20:00";
}

// 토요일이나 일요일에 문을 열면 '주말 진료'
export function isWeekendCare(h: Hospital) {
  return !h.closed_days.includes(6) || !h.closed_days.includes(0);
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

export function closedDaysText(h: Hospital) {
  if (h.closed_days.length === 0) return "연중무휴";
  if (h.closed_days.length === 1) return `${dayNames[h.closed_days[0]]}요일 휴진`;
  // 토·일처럼 토요일이 먼저 오게 정렬
  const sorted = [...h.closed_days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  return `${sorted.map((d) => dayNames[d]).join("·")} 휴진`;
}
