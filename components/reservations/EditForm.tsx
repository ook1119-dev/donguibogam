"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import BottomCTA from "@/components/BottomCTA";
import DatePicker from "@/components/reserve/DatePicker";
import TimeSlotGrid from "@/components/reserve/TimeSlotGrid";
import { changeReservation } from "@/lib/actions";
import type { Hospital } from "@/lib/hospitals";
import { dayOptions, formatDate, timeOptions } from "@/lib/schedule";

type Props = {
  reservationId: string;
  current: { date: string; time: string }; // 지금 예약된 날짜·시간
  hospital: Hospital;
  now: { date: string; time: string };
  booked: string[]; // 다른 사람이 예약한 칸 (내 예약은 빠져 있어요)
};

// 예약 날짜·시간 바꾸기 (예약하기 화면의 날짜·시간 고르기를 그대로 다시 써요)
export default function EditForm({ reservationId, current, hospital, now, booked }: Props) {
  const router = useRouter();
  const bookedSet = useMemo(() => new Set(booked), [booked]);
  const days = dayOptions(hospital, now, bookedSet);

  const [date, setDate] = useState<string | null>(() =>
    days.some((d) => d.date === current.date && !d.disabled)
      ? current.date
      : (days.find((d) => !d.disabled)?.date ?? null),
  );
  const [time, setTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // 지금 예약한 칸은 '현재'로 표시하고 고를 수 없게 해요.
  const times = date
    ? timeOptions(hospital, date, now, bookedSet).map((t) =>
        date === current.date && t.time === current.time
          ? { ...t, disabled: true, note: "현재" }
          : t,
      )
    : [];
  const selectedTime = times.some((t) => t.time === time && !t.disabled) ? time : null;

  function submit() {
    if (!date || !selectedTime) return;
    setError(null);
    startTransition(async () => {
      const result = await changeReservation(reservationId, date, selectedTime);
      if (result.ok) {
        router.replace(`/reservations/${reservationId}?updated=1`);
      } else {
        setError(result.error);
        if (result.slotTaken) {
          setTime(null);
          router.refresh();
        }
      }
    });
  }

  return (
    <div className="space-y-8 px-5 pt-4 pb-28">
      <div className="rounded-2xl bg-page p-4">
        <p className="text-[13px] text-gray-500">현재 예약</p>
        <p className="mt-0.5 text-[17px] font-bold">
          {formatDate(current.date)} {current.time}
        </p>
        <p className="text-[14px] text-gray-600">{hospital.name}</p>
      </div>

      <section>
        <h2 className="mb-3 flex items-baseline gap-2 text-[18px] font-bold">
          바꿀 날짜
          {date && <span className="text-[15px] font-semibold text-brand">{formatDate(date)}</span>}
        </h2>
        <DatePicker
          options={days}
          today={now.date}
          value={date}
          onChange={(d) => {
            setDate(d);
            setTime(null);
          }}
        />
      </section>

      {date && (
        <section>
          <h2 className="mb-3 flex items-baseline gap-2 text-[18px] font-bold">
            바꿀 시간
            {selectedTime && <span className="text-[15px] font-semibold text-brand">{selectedTime}</span>}
          </h2>
          <TimeSlotGrid options={times} value={selectedTime} onChange={setTime} />
        </section>
      )}

      <BottomCTA>
        {error && (
          <p role="alert" className="mb-2 text-center text-[14px] font-medium text-red-500">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!date || !selectedTime || pending}
          className="h-14 w-full rounded-2xl bg-brand text-[17px] font-semibold text-white transition-colors disabled:bg-gray-200 disabled:text-gray-500"
        >
          {pending
            ? "바꾸는 중…"
            : date && selectedTime
              ? `${formatDate(date)} ${selectedTime}으로 변경하기`
              : "바꿀 날짜와 시간을 골라 주세요"}
        </button>
      </BottomCTA>
    </div>
  );
}
