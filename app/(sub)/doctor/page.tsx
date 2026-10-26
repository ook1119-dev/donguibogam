import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CaretRightIcon, ChatCircleDotsIcon } from "@phosphor-icons/react/ssr";
import BackHeader from "@/components/BackHeader";
import DoctorLogin from "@/components/doctor/DoctorLogin";
import DoctorToolbar from "@/components/doctor/DoctorToolbar";
import StatusBadge from "@/components/reservations/StatusBadge";
import { getDoctorHospitalId } from "@/lib/access";
import { getHospitalReservations, getHospitals } from "@/lib/data";
import { reservationState, visitTypeName } from "@/lib/reservations";
import { addDays, BOOKING_DAYS, formatDate, seoulNow } from "@/lib/schedule";

// 의사 모드: 로그인 전엔 병원 고르기, 로그인 후엔 우리 병원 예약 목록
export default function DoctorPage() {
  return (
    <>
      <BackHeader title="의사 모드" fallbackHref="/more" />
      {/* 로그인 쿠키는 접속할 때 정해져서 Suspense로 감싸요 */}
      <Suspense fallback={<div className="mx-5 mt-4 h-40 animate-pulse rounded-2xl bg-gray-100" />}>
        <DoctorHome />
      </Suspense>
    </>
  );
}

async function DoctorHome() {
  const [hospitalId, hospitals] = await Promise.all([getDoctorHospitalId(), getHospitals()]);
  const hospital = hospitals.find((h) => h.id === hospitalId);

  if (!hospital) {
    return (
      <DoctorLogin
        hospitals={hospitals.map(({ id, name, doctor_name, doctor_image }) => ({
          id,
          name,
          doctor_name,
          doctor_image,
        }))}
      />
    );
  }

  const now = seoulNow();
  const rows = await getHospitalReservations(
    hospital.id,
    addDays(now.date, -1),
    addDays(now.date, BOOKING_DAYS),
  );
  const items = rows.map((row) => ({ ...row, state: reservationState(row.reservation, now) }));
  const groups = [
    { title: "다가오는 예약", items: items.filter((x) => x.state === "upcoming") },
    { title: "지난 예약 (어제·오늘)", items: items.filter((x) => x.state === "past").reverse() },
    { title: "취소된 예약", items: items.filter((x) => x.state === "cancelled") },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="px-5 pb-10">
      <div className="flex items-center gap-3 rounded-2xl bg-ink p-4 text-white">
        <span className="flex size-12 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-white/90">
          <Image src={hospital.doctor_image} alt="" width={44} height={44} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold">{hospital.name}</p>
          <p className="text-[13px] text-white/70">{hospital.doctor_name} 원장님, 안녕하세요</p>
        </div>
        <span className="rounded-full bg-white">
          <DoctorToolbar />
        </span>
      </div>

      {groups.length === 0 && (
        <p className="py-16 text-center text-[15px] text-gray-500">
          아직 예약이 없어요.
          <br />
          환자 화면에서 이 병원을 예약해 보세요.
        </p>
      )}

      {groups.map((g) => (
        <section key={g.title} className="mt-7">
          <h2 className="mb-3 text-[17px] font-bold">
            {g.title} <span className="text-brand">{g.items.length}</span>
          </h2>
          <ul className="space-y-3">
            {g.items.map(({ reservation: r, lastMessage, state }) => (
              <li key={r.id}>
                <Link
                  href={`/doctor/reservations/${r.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge state={state} />
                      <span className="text-[13px] text-gray-500">{visitTypeName(r.visit_type)}</span>
                      {lastMessage?.sender === "patient" && (
                        <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
                          답장 필요
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[16px] font-bold">
                      {r.nickname} 님 · {formatDate(r.reserved_date)} {r.reserved_time}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[14px] text-gray-600">{r.symptom}</p>
                    {lastMessage && (
                      <p className="mt-1.5 flex items-center gap-1 text-[13px] text-gray-400">
                        <ChatCircleDotsIcon size={14} weight="fill" className="shrink-0" />
                        <span className="truncate">
                          {lastMessage.sender === "doctor" ? "나: " : ""}
                          {lastMessage.body}
                        </span>
                      </p>
                    )}
                  </div>
                  <CaretRightIcon size={18} className="shrink-0 text-gray-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
