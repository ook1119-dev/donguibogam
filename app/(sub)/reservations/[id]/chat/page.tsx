import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import BackHeader from "@/components/BackHeader";
import ChatHeaderCard from "@/components/chat/ChatHeaderCard";
import ChatRoom from "@/components/chat/ChatRoom";
import { hasReservationAccess } from "@/lib/access";
import { getHospital, getMessages, getReservation } from "@/lib/data";

// 환자 쪽 대화창 (비밀번호를 확인한 사람만)
export default function PatientChatPage({ params }: PageProps<"/reservations/[id]/chat">) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <PatientChat params={params} />
    </Suspense>
  );
}

async function PatientChat({ params }: Pick<PageProps<"/reservations/[id]/chat">, "params">) {
  const { id } = await params;
  if (!(await hasReservationAccess(id))) redirect(`/reservations/${id}`);

  const reservation = await getReservation(id);
  if (!reservation) notFound();
  const hospital = await getHospital(reservation.hospital_id);
  if (!hospital) notFound();
  const messages = await getMessages(reservation.id);

  return (
    <>
      <BackHeader title={`${hospital.doctor_name} 원장`} fallbackHref={`/reservations/${id}`} />
      <ChatHeaderCard reservation={reservation} hospitalName={hospital.name} />
      <ChatRoom
        reservationId={reservation.id}
        me="patient"
        initialMessages={messages}
        peerName={`${hospital.doctor_name} 원장`}
        doctorImage={hospital.doctor_image}
        canSend={reservation.status !== "cancelled"}
        notice={
          reservation.visit_type === "consult"
            ? "비대면 상담 대화창이에요. 의사 선생님이 확인하면 답장해 드려요. (데모: 답장은 '더 보기 → 의사 모드'에서 보낼 수 있어요)"
            : "방문 전에 궁금한 점을 물어보세요. (데모: 답장은 '더 보기 → 의사 모드'에서 보낼 수 있어요)"
        }
      />
    </>
  );
}

function ChatSkeleton() {
  return (
    <div className="animate-pulse px-4 pt-16">
      <div className="h-16 rounded-2xl bg-gray-100" />
      <div className="mt-6 h-10 w-2/3 rounded-2xl bg-gray-100" />
      <div className="mt-3 ml-auto h-10 w-1/2 rounded-2xl bg-gray-100" />
    </div>
  );
}
