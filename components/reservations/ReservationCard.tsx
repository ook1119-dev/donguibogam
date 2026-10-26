import Image from "next/image";
import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/ssr";
import StatusBadge from "@/components/reservations/StatusBadge";
import type { Hospital } from "@/lib/hospitals";
import { visitTypeName, type ReservationState, type ReservationSummary } from "@/lib/reservations";
import { formatDate } from "@/lib/schedule";

// 예약 내역 목록의 예약 한 장
export default function ReservationCard({
  reservation: r,
  hospital,
  state,
}: {
  reservation: ReservationSummary;
  hospital: Hospital | undefined;
  state: ReservationState;
}) {
  return (
    <Link
      href={`/reservations/${r.id}`}
      className={`flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] ${
        state === "cancelled" ? "opacity-60" : ""
      }`}
    >
      <div className="flex size-14 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-doctor-bg">
        {hospital && <Image src={hospital.doctor_image} alt="" width={50} height={50} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <StatusBadge state={state} />
          <span className="text-[13px] text-gray-500">{visitTypeName(r.visit_type)}</span>
        </div>
        <p className="mt-1 truncate text-[17px] font-bold">{hospital?.name ?? "알 수 없는 병원"}</p>
        <p className={`text-[14px] text-gray-600 ${state === "cancelled" ? "line-through" : ""}`}>
          {formatDate(r.reserved_date)} {r.reserved_time}
        </p>
      </div>
      <CaretRightIcon size={18} className="shrink-0 text-gray-300" />
    </Link>
  );
}
