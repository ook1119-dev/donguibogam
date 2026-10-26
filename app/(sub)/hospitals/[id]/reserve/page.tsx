import Image from "next/image";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import BackHeader from "@/components/BackHeader";
import ReserveForm from "@/components/reserve/ReserveForm";
import { getBookedSlots, getHospital, getHospitals } from "@/lib/data";
import { findDepartment } from "@/lib/departments";
import type { Hospital } from "@/lib/hospitals";
import { addDays, BOOKING_DAYS, seoulNow } from "@/lib/schedule";

export async function generateStaticParams() {
  const hospitals = await getHospitals();
  return hospitals.map((h) => ({ id: String(h.id) }));
}

export default async function ReservePage({ params }: PageProps<"/hospitals/[id]/reserve">) {
  const { id } = await params;
  const hospital = await getHospital(Number(id));
  if (!hospital) notFound();

  return (
    <>
      <BackHeader title="예약하기" fallbackHref={`/hospitals/${hospital.id}`} />

      <div className="mx-5 flex items-center gap-3 rounded-2xl bg-page p-3">
        <div className="flex size-12 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-doctor-bg">
          <Image src={hospital.doctor_image} alt="" width={44} height={44} loading="eager" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold">{hospital.name}</p>
          <p className="text-[13px] text-gray-500">
            {hospital.doctor_name} 원장 · {findDepartment(hospital.department)?.name}
          </p>
        </div>
      </div>

      {/* 지금 시각과 예약 현황은 접속할 때마다 새로 계산해야 해서 Suspense로 감싸요 */}
      <Suspense fallback={<FormSkeleton />}>
        <ReserveFormLoader hospital={hospital} />
      </Suspense>
    </>
  );
}

async function ReserveFormLoader({ hospital }: { hospital: Hospital }) {
  await connection();
  const now = seoulNow();
  const booked = await getBookedSlots(hospital.id, now.date, addDays(now.date, BOOKING_DAYS - 1));

  return <ReserveForm hospital={hospital} now={now} booked={booked} />;
}

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-9 px-5 pt-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-32 rounded-2xl bg-gray-100" />
        <div className="h-32 rounded-2xl bg-gray-100" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[78px] w-[58px] rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-11 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
