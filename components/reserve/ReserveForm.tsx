"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import BottomCTA from "@/components/BottomCTA";
import DatePicker from "@/components/reserve/DatePicker";
import ReserveComplete from "@/components/reserve/ReserveComplete";
import TimeSlotGrid from "@/components/reserve/TimeSlotGrid";
import { createReservation, type CreatedReservation } from "@/lib/actions";
import type { Hospital } from "@/lib/hospitals";
import {
  checkNickname,
  checkPassword,
  checkSymptom,
  SYMPTOM_MAX,
  visitTypes,
  type VisitType,
} from "@/lib/reservations";
import { dayOptions, formatDate, timeOptions } from "@/lib/schedule";

type Props = {
  hospital: Hospital;
  now: { date: string; time: string }; // 서버가 알려준 지금 한국 시각
  booked: string[]; // 이미 예약된 칸
};

export default function ReserveForm({ hospital, now, booked }: Props) {
  const router = useRouter();
  const bookedSet = useMemo(() => new Set(booked), [booked]);
  const days = dayOptions(hospital, now, bookedSet);

  const [visitType, setVisitType] = useState<VisitType | null>(null);
  const [date, setDate] = useState<string | null>(() => days.find((d) => !d.disabled)?.date ?? null);
  const [time, setTime] = useState<string | null>(null);
  const [symptom, setSymptom] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<CreatedReservation | null>(null);
  const [pending, startTransition] = useTransition();

  const times = date ? timeOptions(hospital, date, now, bookedSet) : [];
  // 고른 시간이 그새 마감됐으면(새로고침 후) 선택을 없던 걸로 해요.
  const selectedTime = times.some((t) => t.time === time && !t.disabled) ? time : null;

  // 아직 안 채운 칸을 위에서부터 차례로 안내해요.
  const missing = !visitType
    ? "진료 방식을 골라 주세요"
    : !date || !selectedTime
      ? "날짜와 시간을 골라 주세요"
      : checkSymptom(symptom.trim())
        ? "증상을 2자 이상 적어 주세요"
        : checkNickname(nickname.trim())
          ? "닉네임을 입력해 주세요"
          : checkPassword(password)
            ? "비밀번호 4자리를 입력해 주세요"
            : null;

  function submit() {
    if (missing || !visitType || !date || !selectedTime) return;
    setError(null);
    startTransition(async () => {
      const result = await createReservation({
        hospitalId: hospital.id,
        visitType,
        date,
        time: selectedTime,
        symptom: symptom.trim(),
        nickname: nickname.trim(),
        password,
      });
      if (result.ok) {
        setDone(result.reservation);
        window.scrollTo({ top: 0 });
      } else {
        setError(result.error);
        if (result.slotTaken) {
          setTime(null);
          router.refresh(); // 최신 예약 현황 다시 불러오기
        }
      }
    });
  }

  if (done) return <ReserveComplete reservation={done} />;

  const nicknameError = nickname.length > 0 ? checkNickname(nickname.trim()) : null;
  const passwordError = password.length > 0 ? checkPassword(password) : null;

  return (
    <div className="space-y-9 px-5 pt-6 pb-28">
      <Section title="어떤 진료를 원하세요?">
        <div className="grid grid-cols-2 gap-3">
          {visitTypes.map((v) => {
            const selected = v.id === visitType;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setVisitType(v.id)}
                className={`flex flex-col items-center rounded-2xl border-2 px-3 py-4 transition-colors ${
                  selected ? "border-brand bg-brand-soft" : "border-line bg-white"
                }`}
              >
                <Image src={v.icon} alt="" width={48} height={48} />
                <span className={`mt-2 text-[16px] font-bold ${selected ? "text-brand" : ""}`}>
                  {v.name}
                </span>
                <span className="mt-0.5 text-[13px] text-gray-500">{v.description}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="날짜" sub={date ? formatDate(date) : undefined}>
        <DatePicker
          options={days}
          today={now.date}
          value={date}
          onChange={(d) => {
            setDate(d);
            setTime(null);
          }}
        />
      </Section>

      {date && (
        <Section title="시간" sub={selectedTime ?? undefined}>
          <TimeSlotGrid options={times} value={selectedTime} onChange={setTime} />
        </Section>
      )}

      <Section title="증상 메모">
        <textarea
          value={symptom}
          onChange={(e) => setSymptom(e.target.value.slice(0, SYMPTOM_MAX))}
          rows={4}
          placeholder={"예) 어제부터 목이 아프고 열이 나요.\n이름·연락처 같은 개인정보는 적지 마세요."}
          className="w-full scroll-mb-40 resize-none rounded-2xl border border-line p-4 text-[15px] outline-none placeholder:text-gray-400 focus:border-brand"
        />
        <p className="mt-1 text-right text-[12px] text-gray-400">
          {symptom.length}/{SYMPTOM_MAX}
        </p>
      </Section>

      <Section title="예약자 정보">
        <div className="space-y-4">
          <Field
            label="닉네임"
            hint="내 예약을 찾을 때 써요 (한글·영문·숫자 2~12자)"
            error={nicknameError}
          >
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 12))}
              placeholder="예) 감기조심"
              autoComplete="off"
              className="h-13 w-full scroll-mb-40 rounded-2xl border border-line px-4 text-[16px] outline-none placeholder:text-gray-400 focus:border-brand"
            />
          </Field>
          <Field
            label="비밀번호 4자리"
            hint="예약을 바꾸거나 취소할 때 필요해요. 꼭 기억해 주세요!"
            error={passwordError}
          >
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              placeholder="숫자 4자리"
              className="h-13 w-full scroll-mb-40 rounded-2xl border border-line px-4 text-[16px] tracking-[0.3em] outline-none placeholder:tracking-normal placeholder:text-gray-400 focus:border-brand"
            />
          </Field>
        </div>
      </Section>

      <BottomCTA>
        {error && (
          <p role="alert" className="mb-2 text-center text-[14px] font-medium text-red-500">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={missing !== null || pending}
          className="h-14 w-full rounded-2xl bg-brand text-[17px] font-semibold text-white transition-colors disabled:bg-gray-200 disabled:text-gray-500"
        >
          {pending
            ? "예약하는 중…"
            : (missing ?? `${formatDate(date!)} ${selectedTime} 예약하기`)}
        </button>
      </BottomCTA>
    </div>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-baseline gap-2 text-[18px] font-bold">
        {title}
        {sub && <span className="text-[15px] font-semibold text-brand">{sub}</span>}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint: string;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-medium text-gray-700">{label}</span>
      {children}
      <span className={`mt-1.5 block text-[13px] ${error ? "text-red-500" : "text-gray-400"}`}>
        {error ?? hint}
      </span>
    </label>
  );
}
