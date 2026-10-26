import type { Hospital } from "./hospitals";

// 예약 날짜·시간 규칙 (화면과 서버가 똑같은 규칙을 쓰도록 한곳에 모았어요)
// 날짜는 "2026-10-27", 시간은 "14:30" 같은 글자로 다뤄요.

export const BOOKING_DAYS = 14; // 오늘부터 2주까지 예약 가능
export const SLOT_MINUTES = 30;

// Vercel 서버는 미국/UTC 시간으로 돌아가서, 항상 한국 시간으로 계산해요.
export function seoulNow(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function toUTCDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(date: string, days: number) {
  const d = toUTCDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// 0=일 … 6=토
export function weekdayOf(date: string) {
  return toUTCDate(date).getUTCDay();
}

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

// "10월 27일 (화)"
export function formatDate(date: string) {
  const [, m, d] = date.split("-").map(Number);
  return `${m}월 ${d}일 (${dayNames[weekdayOf(date)]})`;
}

export function dayName(date: string) {
  return dayNames[weekdayOf(date)];
}

// 오늘부터 BOOKING_DAYS일 동안의 날짜 목록
export function bookableDates(today: string) {
  return Array.from({ length: BOOKING_DAYS }, (_, i) => addDays(today, i));
}

export function isClosedOn(h: Hospital, date: string) {
  return h.closed_days.includes(weekdayOf(date));
}

const toMinutes = (t: string) => {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
};
const toTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

// 진료 시작~끝까지 30분 간격, 점심시간은 빼고
export function timeSlots(h: Hospital) {
  const slots: string[] = [];
  const lunchStart = h.lunch_start ? toMinutes(h.lunch_start) : null;
  const lunchEnd = h.lunch_end ? toMinutes(h.lunch_end) : null;

  for (let m = toMinutes(h.open_time); m + SLOT_MINUTES <= toMinutes(h.close_time); m += SLOT_MINUTES) {
    const inLunch = lunchStart !== null && lunchEnd !== null && m >= lunchStart && m < lunchEnd;
    if (!inLunch) slots.push(toTime(m));
  }
  return slots;
}

export function isPast(date: string, time: string, now: { date: string; time: string }) {
  return date < now.date || (date === now.date && time <= now.time);
}

// booked: 이미 예약된 칸 모음 ("2026-10-27 14:30" 형태)
export function timeOptions(
  h: Hospital,
  date: string,
  now: { date: string; time: string },
  booked: Set<string>,
) {
  return timeSlots(h).map((time) => ({
    time,
    disabled: isPast(date, time, now) || booked.has(`${date} ${time}`),
  }));
}

export function dayOptions(h: Hospital, now: { date: string; time: string }, booked: Set<string>) {
  return bookableDates(now.date).map((date) => {
    if (isClosedOn(h, date)) return { date, disabled: true, note: "휴진" };
    const hasOpenSlot = timeOptions(h, date, now, booked).some((t) => !t.disabled);
    return hasOpenSlot ? { date, disabled: false } : { date, disabled: true, note: "마감" };
  });
}

// 고른 날짜·시간이 예약 가능한지 검사해요. 문제가 있으면 안내 문장, 괜찮으면 null.
export function checkSlot(
  h: Hospital,
  date: string,
  time: string,
  now: { date: string; time: string },
) {
  if (!bookableDates(now.date).includes(date)) return "오늘부터 2주 안의 날짜만 예약할 수 있어요.";
  if (isClosedOn(h, date)) return "병원이 쉬는 날이에요.";
  if (!timeSlots(h).includes(time)) return "진료 시간이 아니에요.";
  if (isPast(date, time, now)) return "이미 지난 시간이에요.";
  return null;
}
