import type { ReservationState } from "@/lib/reservations";

const styles: Record<ReservationState, { label: string; className: string }> = {
  upcoming: { label: "예약 확정", className: "bg-brand-soft text-brand" },
  past: { label: "지난 예약", className: "bg-gray-100 text-gray-500" },
  cancelled: { label: "취소됨", className: "bg-red-50 text-red-500" },
};

export default function StatusBadge({ state }: { state: ReservationState }) {
  const s = styles[state];
  return (
    <span className={`rounded-md px-2 py-0.5 text-[12px] font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
}
