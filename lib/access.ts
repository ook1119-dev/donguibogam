import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// '통과 쿠키': 비밀번호(또는 의사 코드)를 한 번 맞히면 잠시 동안 다시 묻지 않아요.
// 쿠키 값은 서버만 아는 키로 서명해서, 브라우저에서 고쳐 쓰면 바로 들통나요.
// 아래 grant…/revoke… 함수는 Server Action 안에서만 부를 수 있어요 (쿠키 저장).

function sign(purpose: string, value: string) {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY가 없어요.");
  return createHmac("sha256", key).update(`${purpose}:${value}`).digest("base64url");
}

function sameSignature(a: string, b: string) {
  return a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

async function setSignedCookie(name: string, purpose: string, value: string, minutes: number) {
  const expiresAt = Date.now() + minutes * 60 * 1000;
  const payload = `${value}.${expiresAt}`;
  (await cookies()).set(name, `${payload}.${sign(purpose, payload)}`, {
    httpOnly: true, // 화면의 자바스크립트로는 읽을 수 없게
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: minutes * 60,
  });
}

// 서명이 맞고 아직 유효하면 저장했던 값을, 아니면 null
async function readSignedCookie(name: string, purpose: string) {
  const raw = (await cookies()).get(name)?.value;
  if (!raw) return null;

  const [value, expiresAt, signature = ""] = raw.split(".");
  if (!(Number(expiresAt) > Date.now())) return null;
  if (!sameSignature(signature, sign(purpose, `${value}.${expiresAt}`))) return null;
  return value;
}

// ── 환자: 예약 비밀번호 확인 (1시간) ─────────────────────────────

export async function grantReservationAccess(reservationId: string) {
  await setSignedCookie(`rsv_${reservationId}`, "reservation-access", reservationId, 60);
}

export async function hasReservationAccess(reservationId: string) {
  return (await readSignedCookie(`rsv_${reservationId}`, "reservation-access")) === reservationId;
}

// ── 의사 모드: 병원 하나에 로그인 (12시간) ────────────────────────

export async function grantDoctorAccess(hospitalId: number) {
  await setSignedCookie("doctor", "doctor-access", String(hospitalId), 12 * 60);
}

export async function getDoctorHospitalId() {
  const value = await readSignedCookie("doctor", "doctor-access");
  return value ? Number(value) : null;
}

export async function revokeDoctorAccess() {
  (await cookies()).delete("doctor");
}
