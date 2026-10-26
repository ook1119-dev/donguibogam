import { visitTypeName, type Reservation } from "@/lib/reservations";
import { formatDate } from "@/lib/schedule";

// 대화창 위에 붙는 예약 요약 (의사 모드에서는 증상 메모도 보여줘요)
export default function ChatHeaderCard({
  reservation: r,
  hospitalName,
  showSymptom = false,
}: {
  reservation: Reservation;
  hospitalName: string;
  showSymptom?: boolean;
}) {
  return (
    <div className="mx-4 rounded-2xl bg-brand-soft px-4 py-3 text-[13px]">
      <p className="font-semibold text-brand">
        {visitTypeName(r.visit_type)} · {formatDate(r.reserved_date)} {r.reserved_time}
        {r.status === "cancelled" && " · 취소됨"}
      </p>
      <p className="mt-0.5 text-gray-600">{hospitalName}</p>
      {showSymptom && (
        <p className="mt-2 border-t border-brand/15 pt-2 whitespace-pre-wrap text-ink">
          <span className="font-semibold">증상 메모 </span>
          {r.symptom}
        </p>
      )}
    </div>
  );
}
