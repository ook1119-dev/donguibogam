"use server";

import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  getDoctorHospitalId,
  grantDoctorAccess,
  grantReservationAccess,
  hasReservationAccess,
  revokeDoctorAccess,
} from "./access";
import { checkMessage, type ChatRole, type Message } from "./chat";
import { getHospital, getMessages, getReservation } from "./data";
import {
  checkNickname,
  checkPassword,
  checkSymptom,
  PASSWORD_RULE,
  reservationState,
  UUID_RULE,
  visitTypes,
  type VisitType,
} from "./reservations";
import { checkSlot, seoulNow } from "./schedule";
import { getSupabase } from "./supabase";

// 이 파일의 함수는 화면 버튼뿐 아니라 누구나 직접 호출할 수 있어요.
// 그래서 화면에서 이미 검사했더라도 서버에서 한 번 더 모두 검사해요.

export type CreateReservationInput = {
  hospitalId: number;
  visitType: VisitType;
  date: string;
  time: string;
  symptom: string;
  nickname: string;
  password: string;
};

export type CreatedReservation = {
  id: string;
  hospitalName: string;
  doctorName: string;
  visitType: VisitType;
  date: string;
  time: string;
  nickname: string;
};

export type CreateReservationResult =
  | { ok: true; reservation: CreatedReservation }
  | { ok: false; error: string; slotTaken?: boolean };

export async function createReservation(
  input: CreateReservationInput,
): Promise<CreateReservationResult> {
  const nickname = String(input.nickname ?? "").trim();
  const password = String(input.password ?? "");
  const symptom = String(input.symptom ?? "").trim();
  const date = String(input.date ?? "");
  const time = String(input.time ?? "");
  const visitType = input.visitType;

  const hospital = await getHospital(Number(input.hospitalId));
  if (!hospital) return { ok: false, error: "병원을 찾을 수 없어요." };
  if (!visitTypes.some((v) => v.id === visitType)) {
    return { ok: false, error: "진료 방식을 골라 주세요." };
  }

  const problem =
    checkSlot(hospital, date, time, seoulNow()) ??
    checkSymptom(symptom) ??
    checkNickname(nickname) ??
    checkPassword(password);
  if (problem) return { ok: false, error: problem };

  // 비밀번호는 그대로 저장하지 않고 bcrypt로 암호화해요.
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await getSupabase()
    .from("reservations")
    .insert({
      hospital_id: hospital.id,
      visit_type: visitType,
      reserved_date: date,
      reserved_time: time,
      symptom,
      nickname,
      password_hash,
    })
    .select("id")
    .single();

  if (error) {
    // 23505 = DB의 '같은 시간 중복 예약 금지' 규칙에 걸림 (거의 동시에 다른 사람이 예약)
    if (error.code === "23505") {
      return {
        ok: false,
        error: "방금 다른 분이 이 시간을 예약했어요. 다른 시간을 골라 주세요.",
        slotTaken: true,
      };
    }
    console.error("createReservation:", error);
    return { ok: false, error: "예약을 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  return {
    ok: true,
    reservation: {
      id: data.id,
      hospitalName: hospital.name,
      doctorName: hospital.doctor_name,
      visitType,
      date,
      time,
      nickname,
    },
  };
}

// ── 5·6단계: 비밀번호 확인, 날짜·시간 변경, 취소 ────────────────────────

export type SimpleResult = { ok: true } | { ok: false; error: string; slotTaken?: boolean };

export async function verifyReservationPassword(
  id: string,
  password: string,
): Promise<SimpleResult> {
  if (!UUID_RULE.test(String(id)) || !PASSWORD_RULE.test(String(password))) {
    return { ok: false, error: "비밀번호가 맞지 않아요." };
  }

  const { data, error } = await getSupabase()
    .from("reservations")
    .select("password_hash, locked_until")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("verifyReservationPassword:", error);
    return { ok: false, error: "잠시 후 다시 시도해 주세요." };
  }
  if (!data) return { ok: false, error: "예약을 찾을 수 없어요." };

  // 숫자 4자리는 1만 가지뿐이라, 5번 틀리면 10분 동안 아예 비교하지 않아요.
  const lockedMessage = (until: string) =>
    `비밀번호를 5번 틀려서 잠겼어요. ${Math.ceil((new Date(until).getTime() - Date.now()) / 60000)}분 뒤에 다시 시도해 주세요.`;
  const isLocked = (until: string | null) => !!until && new Date(until).getTime() > Date.now();
  if (isLocked(data.locked_until)) return { ok: false, error: lockedMessage(data.locked_until) };

  const matches = await bcrypt.compare(password, data.password_hash);
  if (!matches) {
    // 틀린 횟수 +1 (5번째면 DB가 10분 잠금을 걸어요)
    const { data: lockedUntil } = await getSupabase().rpc("register_failed_attempt", { rid: id });
    if (isLocked(lockedUntil)) return { ok: false, error: lockedMessage(lockedUntil) };
    return { ok: false, error: "비밀번호가 맞지 않아요. 5번 틀리면 10분 동안 잠겨요." };
  }

  await getSupabase()
    .from("reservations")
    .update({ failed_attempts: 0, locked_until: null })
    .eq("id", id);
  await grantReservationAccess(id);
  return { ok: true };
}

// 변경·취소 전에 공통으로 확인: 비밀번호 통과 쿠키가 있고, 아직 다가오는 예약인지
async function loadChangeableReservation(id: string) {
  if (!UUID_RULE.test(String(id)) || !(await hasReservationAccess(id))) {
    return { ok: false as const, error: "비밀번호 확인 시간이 지났어요. 다시 입력해 주세요." };
  }
  const reservation = await getReservation(id);
  if (!reservation) return { ok: false as const, error: "예약을 찾을 수 없어요." };

  const state = reservationState(reservation, seoulNow());
  if (state === "cancelled") return { ok: false as const, error: "이미 취소된 예약이에요." };
  if (state === "past") return { ok: false as const, error: "지난 예약은 바꿀 수 없어요." };
  return { ok: true as const, reservation };
}

export async function changeReservation(
  id: string,
  date: string,
  time: string,
): Promise<SimpleResult> {
  const loaded = await loadChangeableReservation(id);
  if (!loaded.ok) return loaded;
  const r = loaded.reservation;

  if (r.reserved_date === date && r.reserved_time === time) {
    return { ok: false, error: "지금 예약과 같은 시간이에요." };
  }
  const hospital = await getHospital(r.hospital_id);
  if (!hospital) return { ok: false, error: "병원을 찾을 수 없어요." };

  const problem = checkSlot(hospital, String(date), String(time), seoulNow());
  if (problem) return { ok: false, error: problem };

  const { error } = await getSupabase()
    .from("reservations")
    .update({ reserved_date: date, reserved_time: time, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "booked");

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "방금 다른 분이 이 시간을 예약했어요. 다른 시간을 골라 주세요.",
        slotTaken: true,
      };
    }
    console.error("changeReservation:", error);
    return { ok: false, error: "예약을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  return { ok: true };
}

export async function cancelReservation(id: string): Promise<SimpleResult> {
  const loaded = await loadChangeableReservation(id);
  if (!loaded.ok) return loaded;

  // 지우지 않고 '취소됨'으로 바꿔요. 그 시간은 다른 사람이 다시 예약할 수 있어요.
  const { error } = await getSupabase()
    .from("reservations")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "booked");
  if (error) {
    console.error("cancelReservation:", error);
    return { ok: false, error: "예약을 취소하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  return { ok: true };
}

// ── 6.5단계: 의사 모드 로그인 ─────────────────────────────────

export async function doctorLogin(hospitalId: number, code: string): Promise<SimpleResult> {
  const expected = process.env.DOCTOR_CODE;
  if (!expected) {
    return { ok: false, error: "의사 모드 코드가 설정되지 않았어요. (.env.local의 DOCTOR_CODE)" };
  }
  const hospital = await getHospital(Number(hospitalId));
  if (!hospital) return { ok: false, error: "병원을 골라 주세요." };

  const given = Buffer.from(String(code ?? ""));
  const answer = Buffer.from(expected);
  if (given.length !== answer.length || !timingSafeEqual(given, answer)) {
    // 틀리면 일부러 조금 늦게 답해서, 아무 숫자나 계속 넣어보는 걸 어렵게 해요.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { ok: false, error: "의사 모드 코드가 맞지 않아요." };
  }

  await grantDoctorAccess(hospital.id);
  return { ok: true };
}

export async function doctorLogout() {
  await revokeDoctorAccess();
}

// ── 6.5단계: 대화창 ──────────────────────────────────────────

// 이 대화방을 이 역할로 쓸 수 있는지 확인해요.
// 환자: 그 예약의 비밀번호를 확인했는지 / 의사: 그 병원으로 로그인했는지
async function openChat(reservationId: string, role: ChatRole) {
  if (!UUID_RULE.test(String(reservationId))) return null;
  const reservation = await getReservation(reservationId);
  if (!reservation) return null;

  if (role === "patient" && (await hasReservationAccess(reservationId))) return reservation;
  if (role === "doctor" && (await getDoctorHospitalId()) === reservation.hospital_id) {
    return reservation;
  }
  return null;
}

const CHAT_EXPIRED = "대화창을 열 수 있는 시간이 지났어요. 다시 들어와 주세요.";

export async function pollMessages(
  reservationId: string,
  role: ChatRole,
  afterId: number,
): Promise<{ ok: true; messages: Message[] } | { ok: false; error: string }> {
  if (!(await openChat(reservationId, role))) return { ok: false, error: CHAT_EXPIRED };
  return { ok: true, messages: await getMessages(reservationId, Number(afterId) || 0) };
}

export async function postMessage(
  reservationId: string,
  role: ChatRole,
  body: string,
): Promise<{ ok: true; message: Message } | { ok: false; error: string }> {
  const reservation = await openChat(reservationId, role);
  if (!reservation) return { ok: false, error: CHAT_EXPIRED };
  if (reservation.status === "cancelled") {
    return { ok: false, error: "취소된 예약이라 메시지를 보낼 수 없어요." };
  }

  const text = String(body ?? "").trim();
  const problem = checkMessage(text);
  if (problem) return { ok: false, error: problem };

  const { data, error } = await getSupabase()
    .from("messages")
    .insert({ reservation_id: reservationId, sender: role, body: text })
    .select("id, sender, body, created_at")
    .single();
  if (error) {
    console.error("postMessage:", error);
    return { ok: false, error: "메시지를 보내지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  return { ok: true, message: data as Message };
}
