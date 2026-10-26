import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import BackHeader from "@/components/BackHeader";
import ChatHeaderCard from "@/components/chat/ChatHeaderCard";
import ChatRoom from "@/components/chat/ChatRoom";
import { getDoctorHospitalId } from "@/lib/access";
import { getHospital, getMessages, getReservation } from "@/lib/data";

// 의사 쪽 대화창 (그 병원으로 로그인한 의사만)
export default function DoctorChatPage({ params }: PageProps<"/doctor/reservations/[id]">) {
  return (
    <Suspense fallback={<div className="mx-4 mt-16 h-24 animate-pulse rounded-2xl bg-gray-100" />}>
      <DoctorChat params={params} />
    </Suspense>
  );
}

async function DoctorChat({ params }: Pick<PageProps<"/doctor/reservations/[id]">, "params">) {
  const { id } = await params;
  const hospitalId = await getDoctorHospitalId();
  if (!hospitalId) redirect("/doctor");

  const reservation = await getReservation(id);
  // 다른 병원 예약은 없는 것처럼 보여요.
  if (!reservation || reservation.hospital_id !== hospitalId) notFound();
  const hospital = await getHospital(hospitalId);
  if (!hospital) notFound();
  const messages = await getMessages(reservation.id);

  return (
    <>
      <BackHeader title={`${reservation.nickname} 님`} fallbackHref="/doctor" />
      <ChatHeaderCard reservation={reservation} hospitalName={hospital.name} showSymptom />
      <ChatRoom
        reservationId={reservation.id}
        me="doctor"
        initialMessages={messages}
        peerName={`${reservation.nickname} 님`}
        doctorImage={hospital.doctor_image}
        canSend={reservation.status !== "cancelled"}
        notice={`환자에게는 '${hospital.doctor_name} 원장'으로 보여요.`}
      />
    </>
  );
}
