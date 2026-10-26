import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CalendarCheckIcon,
  CaretRightIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  LockKeyIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr";
import BackHeader from "@/components/BackHeader";
import ReservationActions from "@/components/reservations/ReservationActions";
import { hasReservationAccess } from "@/lib/access";
import { getHospital, getReservation } from "@/lib/data";
import { findDepartment } from "@/lib/departments";
import { reservationState, visitTypeName } from "@/lib/reservations";
import { formatDate, seoulNow } from "@/lib/schedule";

export default function ReservationDetailPage({
  params,
  searchParams,
}: PageProps<"/reservations/[id]">) {
  return (
    <>
      <BackHeader title="예약 상세" fallbackHref="/reservations" />
      {/* 예약 번호(주소)와 비밀번호 확인 여부(쿠키)는 접속할 때 정해져서 Suspense로 감싸요 */}
      <Suspense fallback={<DetailSkeleton />}>
        <ReservationDetail params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const heads = {
  upcoming: { Icon: CalendarCheckIcon, color: "text-brand", title: "예약이 확정됐어요" },
  past: { Icon: ClockCounterClockwiseIcon, color: "text-gray-400", title: "지난 예약이에요" },
  cancelled: { Icon: XCircleIcon, color: "text-red-500", title: "취소된 예약이에요" },
};

async function ReservationDetail({
  params,
  searchParams,
}: Pick<PageProps<"/reservations/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const { updated } = await searchParams;

  const reservation = await getReservation(id);
  if (!reservation) notFound();
  const r = reservation;
  const hospital = await getHospital(r.hospital_id);
  if (!hospital) notFound();

  const unlocked = await hasReservationAccess(r.id);
  const state = reservationState(r, seoulNow());
  const head = heads[state];
  const when = `${formatDate(r.reserved_date)} ${r.reserved_time}`;
  const createdAt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(r.created_at));

  return (
    <div className="pb-28">
      <section className="px-5 pt-4 pb-7">
        <head.Icon size={40} weight="fill" className={head.color} />
        <h1 className="mt-3 text-[24px] font-bold">{head.title}</h1>
        <p className={`mt-1 text-[17px] ${state === "cancelled" ? "text-gray-400 line-through" : "text-gray-700"}`}>
          {when}
        </p>
        {updated === "1" && state === "upcoming" && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-[14px] font-medium text-green-700">
            <CheckCircleIcon size={18} weight="fill" />
            예약 시간이 변경됐어요
          </p>
        )}
      </section>

      <Link
        href={`/hospitals/${hospital.id}`}
        className="mx-5 flex items-center gap-3 rounded-2xl bg-page p-3"
      >
        <div className="flex size-12 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-doctor-bg">
          <Image src={hospital.doctor_image} alt="" width={44} height={44} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold">{hospital.name}</p>
          <p className="text-[13px] text-gray-500">
            {hospital.doctor_name} 원장 · {findDepartment(hospital.department)?.name}
          </p>
        </div>
        <CaretRightIcon size={18} className="text-gray-300" />
      </Link>

      {/* 의사와 대화하기 (비밀번호를 확인해야 열려요) */}
      {state !== "cancelled" &&
        (unlocked ? (
          <Link
            href={`/reservations/${r.id}/chat`}
            className="mx-5 mt-3 flex items-center gap-3 rounded-2xl border-2 border-brand-light bg-white p-4"
          >
            <Image src="/icons/speech.png" alt="" width={40} height={40} />
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold">
                {r.visit_type === "consult" ? "비대면 상담 대화창" : "의사에게 문의하기"}
              </p>
              <p className="text-[13px] text-gray-500">
                {hospital.doctor_name} 원장과 메시지를 주고받아요
              </p>
            </div>
            <CaretRightIcon size={18} className="text-brand" />
          </Link>
        ) : (
          <p className="mx-5 mt-3 flex items-center gap-3 rounded-2xl bg-page p-4 text-[14px] text-gray-500">
            <Image src="/icons/speech.png" alt="" width={32} height={32} className="opacity-50 grayscale" />
            비밀번호를 확인하면 의사와 대화할 수 있어요
          </p>
        ))}

      <dl className="mx-5 mt-6 space-y-3.5 text-[15px]">
        {[
          ["진료 방식", visitTypeName(r.visit_type)],
          ["닉네임", r.nickname],
          ["예약한 날", createdAt],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-4">
            <dt className="w-20 shrink-0 text-gray-500">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-7 h-2 bg-page" />

      <section className="px-5 py-6">
        <h2 className="text-[17px] font-bold">증상 메모</h2>
        {unlocked ? (
          <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap text-gray-700">
            {r.symptom}
          </p>
        ) : (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-page px-4 py-4 text-[14px] text-gray-500">
            <LockKeyIcon size={18} weight="fill" className="text-gray-400" />
            건강 정보라서 비밀번호를 확인한 뒤에 보여드려요
          </p>
        )}
      </section>

      <ReservationActions
        id={r.id}
        hospitalId={hospital.id}
        unlocked={unlocked}
        changeable={state === "upcoming"}
        summary={`${hospital.name} · ${when}`}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse px-5 pt-4">
      <div className="size-10 rounded-full bg-gray-100" />
      <div className="mt-3 h-7 w-2/3 rounded bg-gray-100" />
      <div className="mt-2 h-5 w-1/2 rounded bg-gray-100" />
      <div className="mt-7 h-[72px] rounded-2xl bg-gray-100" />
    </div>
  );
}
