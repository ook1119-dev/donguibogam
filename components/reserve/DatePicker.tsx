"use client";

import { dayName, weekdayOf } from "@/lib/schedule";

type DayOption = { date: string; disabled: boolean; note?: string };

// 가로로 넘기는 날짜 선택 (휴진·마감은 누를 수 없어요)
export default function DatePicker({
  options,
  today,
  value,
  onChange,
}: {
  options: DayOption[];
  today: string;
  value: string | null;
  onChange: (date: string) => void;
}) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      {options.map((o) => {
        const selected = o.date === value;
        const weekday = weekdayOf(o.date);
        const dayColor = weekday === 0 ? "text-red-500" : weekday === 6 ? "text-blue-500" : "text-gray-500";

        return (
          <button
            key={o.date}
            type="button"
            disabled={o.disabled}
            aria-pressed={selected}
            onClick={() => onChange(o.date)}
            className={`flex h-[78px] w-[58px] shrink-0 flex-col items-center justify-center rounded-2xl border transition-colors ${
              selected
                ? "border-brand bg-brand text-white"
                : o.disabled
                  ? "border-gray-100 bg-gray-50 text-gray-300"
                  : "border-line bg-white"
            }`}
          >
            <span
              className={`text-[13px] ${selected ? "text-white" : o.disabled ? "" : dayColor}`}
            >
              {o.date === today ? "오늘" : dayName(o.date)}
            </span>
            <span className="text-[20px] leading-tight font-bold">{Number(o.date.slice(8))}</span>
            {o.note && <span className="text-[11px]">{o.note}</span>}
          </button>
        );
      })}
    </div>
  );
}
