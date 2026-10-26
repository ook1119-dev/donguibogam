import { isPast } from "./schedule";

// 예약 관련 공통 규칙 (화면과 서버가 함께 써요)

export type VisitType = "consult" | "visit";

// Supabase reservations 테이블 한 줄 (비밀번호 암호문은 서버 밖으로 꺼내지 않아요)
export type Reservation = {
  id: string;
  hospital_id: number;
  visit_type: VisitType;
  reserved_date: string;
  reserved_time: string;
  status: "booked" | "cancelled";
  nickname: string;
  symptom: string;
  created_at: string;
};

// 목록에는 건강 정보(증상 메모)를 빼고 보여줘요.
export type ReservationSummary = Omit<Reservation, "symptom">;

export type ReservationState = "upcoming" | "past" | "cancelled";

export function reservationState(
  r: Pick<Reservation, "status" | "reserved_date" | "reserved_time">,
  now: { date: string; time: string },
): ReservationState {
  if (r.status === "cancelled") return "cancelled";
  return isPast(r.reserved_date, r.reserved_time, now) ? "past" : "upcoming";
}

export const UUID_RULE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const visitTypes: { id: VisitType; name: string; description: string; icon: string }[] = [
  {
    id: "consult",
    name: "비대면 상담",
    description: "대화창으로 의사와 상담",
    icon: "/icons/speech.png",
  },
  {
    id: "visit",
    name: "방문 진료",
    description: "병원에 직접 방문",
    icon: "/icons/hospital.png",
  },
];

export function visitTypeName(id: string) {
  return visitTypes.find((v) => v.id === id)?.name ?? id;
}

export const NICKNAME_RULE = /^[가-힣a-zA-Z0-9_]{2,12}$/;
export const PASSWORD_RULE = /^[0-9]{4}$/;
export const SYMPTOM_MAX = 300;

export function checkNickname(nickname: string) {
  return NICKNAME_RULE.test(nickname) ? null : "닉네임은 한글·영문·숫자 2~12자로 입력해 주세요.";
}

export function checkPassword(password: string) {
  return PASSWORD_RULE.test(password) ? null : "비밀번호는 숫자 4자리로 입력해 주세요.";
}

export function checkSymptom(symptom: string) {
  if (symptom.length < 2) return "증상을 2자 이상 적어 주세요.";
  if (symptom.length > SYMPTOM_MAX) return `증상은 ${SYMPTOM_MAX}자까지 적을 수 있어요.`;
  return null;
}
