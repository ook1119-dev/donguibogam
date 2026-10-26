import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import type { Message } from "./chat";
import type { Hospital } from "./hospitals";
import { UUID_RULE, type Reservation, type ReservationSummary } from "./reservations";
import { getSupabase } from "./supabase";

// 병원 목록은 자주 바뀌지 않아서 잠깐 저장(캐시)해 두고 빠르게 보여줘요.
// Supabase에서 고친 내용은 1분쯤 뒤에 앱에 반영돼요.
export async function getHospitals(): Promise<Hospital[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("hospitals");

  const { data, error } = await getSupabase().from("hospitals").select("*").order("id");
  if (error) throw new Error(`병원 목록을 불러오지 못했어요: ${error.message}`);
  return data as Hospital[];
}

export async function getHospital(id: number): Promise<Hospital | null> {
  const hospitals = await getHospitals();
  return hospitals.find((h) => h.id === id) ?? null;
}

// 이미 예약된 칸 ("2026-10-27 14:30" 형태). 누가 예약했는지는 빼고 날짜·시간만 가져와요.
// 예약은 계속 바뀌니까 캐시하지 않고 접속할 때마다 새로 읽어요.
// exceptId: 예약을 변경할 때 '내 예약'은 빼고 보기 위해 써요.
export async function getBookedSlots(
  hospitalId: number,
  from: string,
  to: string,
  exceptId?: string,
) {
  await connection();

  let query = getSupabase()
    .from("reservations")
    .select("reserved_date, reserved_time")
    .eq("hospital_id", hospitalId)
    .eq("status", "booked")
    .gte("reserved_date", from)
    .lte("reserved_date", to);
  if (exceptId) query = query.neq("id", exceptId);

  const { data, error } = await query;
  if (error) throw new Error(`예약 현황을 불러오지 못했어요: ${error.message}`);
  return data.map((r) => `${r.reserved_date} ${r.reserved_time}`);
}

// 아래 예약 함수들은 모두 캐시하지 않아요 (항상 최신 상태).

const SUMMARY_COLUMNS =
  "id, hospital_id, visit_type, reserved_date, reserved_time, status, nickname, created_at";

export async function getReservationsByNickname(nickname: string) {
  const { data, error } = await getSupabase()
    .from("reservations")
    .select(SUMMARY_COLUMNS)
    .eq("nickname", nickname)
    .order("reserved_date", { ascending: false })
    .order("reserved_time", { ascending: false });
  if (error) throw new Error(`예약 목록을 불러오지 못했어요: ${error.message}`);
  return data as ReservationSummary[];
}

export async function getReservation(id: string) {
  if (!UUID_RULE.test(id)) return null;

  const { data, error } = await getSupabase()
    .from("reservations")
    .select(`${SUMMARY_COLUMNS}, symptom`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`예약을 불러오지 못했어요: ${error.message}`);
  return data as Reservation | null;
}

// ── 6.5단계: 대화창, 의사 모드 ─────────────────────────────────

// afterId보다 뒤에 온 메시지만 (처음엔 0 → 전부)
export async function getMessages(reservationId: string, afterId = 0) {
  const { data, error } = await getSupabase()
    .from("messages")
    .select("id, sender, body, created_at")
    .eq("reservation_id", reservationId)
    .gt("id", afterId)
    .order("id")
    .limit(200);
  if (error) throw new Error(`메시지를 불러오지 못했어요: ${error.message}`);
  return data as Message[];
}

// 의사 모드: 우리 병원 예약 + 예약마다 마지막 메시지 (어제부터 2주 뒤까지)
export async function getHospitalReservations(hospitalId: number, from: string, to: string) {
  const { data, error } = await getSupabase()
    .from("reservations")
    .select(`${SUMMARY_COLUMNS}, symptom`)
    .eq("hospital_id", hospitalId)
    .gte("reserved_date", from)
    .lte("reserved_date", to)
    .order("reserved_date")
    .order("reserved_time");
  if (error) throw new Error(`예약 목록을 불러오지 못했어요: ${error.message}`);
  const reservations = data as Reservation[];
  if (reservations.length === 0) return [];

  const { data: messages, error: messageError } = await getSupabase()
    .from("messages")
    .select("reservation_id, sender, body")
    .in("reservation_id", reservations.map((r) => r.id))
    .order("id", { ascending: false });
  if (messageError) throw new Error(`메시지를 불러오지 못했어요: ${messageError.message}`);

  return reservations.map((r) => ({
    reservation: r,
    lastMessage: messages.find((m) => m.reservation_id === r.id) as
      | Pick<Message, "sender" | "body">
      | undefined,
  }));
}
