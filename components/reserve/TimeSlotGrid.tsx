"use client";

// note: "현재"처럼 칸 아래에 붙는 작은 표시 (예약 변경 화면에서 지금 예약한 시간)
type TimeOption = { time: string; disabled: boolean; note?: string };

// 30분 단위 시간 선택 (지난 시간·이미 예약된 시간은 누를 수 없어요)
export default function TimeSlotGrid({
  options,
  value,
  onChange,
}: {
  options: TimeOption[];
  value: string | null;
  onChange: (time: string) => void;
}) {
  if (options.every((o) => o.disabled)) {
    return (
      <p className="rounded-2xl bg-page py-8 text-center text-[15px] text-gray-500">
        이 날은 예약 가능한 시간이 없어요
      </p>
    );
  }

  const groups = [
    { label: "오전", items: options.filter((o) => o.time < "12:00") },
    { label: "오후", items: options.filter((o) => o.time >= "12:00") },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-2 text-[13px] text-gray-500">{g.label}</p>
          <div className="grid grid-cols-4 gap-2">
            {g.items.map((o) => {
              const selected = o.time === value;
              return (
                <button
                  key={o.time}
                  type="button"
                  disabled={o.disabled}
                  aria-pressed={selected}
                  onClick={() => onChange(o.time)}
                  className={`flex h-11 flex-col items-center justify-center rounded-xl border text-[15px] leading-tight transition-colors ${
                    selected
                      ? "border-brand bg-brand font-semibold text-white"
                      : o.note
                        ? "border-brand/40 bg-brand-soft text-brand"
                        : o.disabled
                          ? "border-gray-100 bg-gray-50 text-gray-300 line-through"
                          : "border-line bg-white"
                  }`}
                >
                  {o.time}
                  {o.note && <span className="text-[10px] font-semibold">{o.note}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
