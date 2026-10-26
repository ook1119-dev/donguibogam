import Image from "next/image";
import Link from "next/link";
import { LockKeyIcon } from "@phosphor-icons/react";
import BottomCTA from "@/components/BottomCTA";
import type { CreatedReservation } from "@/lib/actions";
import { visitTypeName } from "@/lib/reservations";
import { formatDate } from "@/lib/schedule";

// 예약 완료 화면
export default function ReserveComplete({ reservation: r }: { reservation: CreatedReservation }) {
  const rows = [
    ["병원", r.hospitalName],
    ["의사", `${r.doctorName} 원장`],
    ["진료 방식", visitTypeName(r.visitType)],
    ["일시", `${formatDate(r.date)} ${r.time}`],
    ["닉네임", r.nickname],
  ];

  return (
    <div className="px-5 pt-8 pb-28 text-center">
      <Image src="/icons/check.png" alt="" width={84} height={84} className="mx-auto" />
      <h1 className="mt-4 text-[24px] font-bold">예약이 완료됐어요</h1>
      <p className="mt-1.5 text-[15px] text-gray-500">
        {formatDate(r.date)} {r.time}에 만나요
      </p>

      <dl className="mt-8 space-y-3 rounded-2xl bg-page p-5 text-left text-[15px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-4">
            <dt className="w-20 shrink-0 text-gray-500">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-soft p-4 text-left text-[14px] text-brand">
        <LockKeyIcon size={20} weight="fill" className="shrink-0" />
        예약을 바꾸거나 취소할 때 비밀번호 4자리가 필요해요. 꼭 기억해 주세요!
      </p>

      <BottomCTA>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex h-14 flex-1 items-center justify-center rounded-2xl border border-line text-[16px] font-semibold text-gray-700"
          >
            홈으로
          </Link>
          <Link
            href={`/reservations?nickname=${encodeURIComponent(r.nickname)}`}
            className="flex h-14 flex-[2] items-center justify-center rounded-2xl bg-brand text-[16px] font-semibold text-white"
          >
            내 예약 보기
          </Link>
        </div>
      </BottomCTA>
    </div>
  );
}
