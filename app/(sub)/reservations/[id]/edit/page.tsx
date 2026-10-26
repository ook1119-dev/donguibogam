import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import BackHeader from "@/components/BackHeader";
import EditForm from "@/components/reservations/EditForm";
import { hasReservationAccess } from "@/lib/access";
import { getBookedSlots, getHospital, getReservation } from "@/lib/data";
import { reservationState } from "@/lib/reservations";
import { addDays, BOOKING_DAYS, seoulNow } from "@/lib/schedule";

export default function EditReservationPage({ params }: PageProps<"/reservations/[id]/edit">) {
  return (
    <>
      <BackHeader title="날짜·시간 변경" fallbackHref="/reservations" />
      <Suspense fallback={<div className="mx-5 mt-4 h-40 animate-pulse rounded-2xl bg-gray-100" />}>
        <EditLoader params={params} />
      </Suspense>
    </>
  );
}

async function EditLoader({ params }: Pick<PageProps<"/reservations/[id]/edit">, "params">) {
  const { id } = await params;

  // 비밀번호를 확인하지 않았거나, 이미 지나간·취소된 예약이면 상세 화면으로 돌려보내요.
  if (!(await hasReservationAccess(id))) redirect(`/reservations/${id}`);
  const reservation = await getReservation(id);
  if (!reservation) notFound();
  const now = seoulNow();
  if (reservationState(reservation, now) !== "upcoming") redirect(`/reservations/${id}`);

  const hospital = await getHospital(reservation.hospital_id);
  if (!hospital) notFound();
  const booked = await getBookedSlots(
    hospital.id,
    now.date,
    addDays(now.date, BOOKING_DAYS - 1),
    reservation.id,
  );

  return (
    <EditForm
      reservationId={reservation.id}
      current={{ date: reservation.reserved_date, time: reservation.reserved_time }}
      hospital={hospital}
      now={now}
      booked={booked}
    />
  );
}
