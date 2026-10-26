import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarXIcon,
  ClockIcon,
  ForkKnifeIcon,
  MapPinIcon,
} from "@phosphor-icons/react/ssr";
import BackHeader from "@/components/BackHeader";
import BottomCTA from "@/components/BottomCTA";
import Rating from "@/components/Rating";
import { getHospital, getHospitals } from "@/lib/data";
import { findDepartment } from "@/lib/departments";
import { closedDaysText, isNightCare, isWeekendCare } from "@/lib/hospitals";

// 병원 10곳의 상세 화면을 미리 만들어 둬요.
export async function generateStaticParams() {
  const hospitals = await getHospitals();
  return hospitals.map((h) => ({ id: String(h.id) }));
}

export default async function HospitalDetailPage({ params }: PageProps<"/hospitals/[id]">) {
  const { id } = await params;
  const hospital = await getHospital(Number(id));
  if (!hospital) notFound();

  const h = hospital;
  const badges = [isNightCare(h) && "야간 진료", isWeekendCare(h) && "주말 진료"].filter(Boolean);

  return (
    <div className="pb-24">
      <BackHeader fallbackHref="/hospitals" />

      <section className="flex items-start gap-4 px-5 pt-2 pb-6">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-brand">
            {findDepartment(h.department)?.name}
          </p>
          <h1 className="mt-0.5 text-[24px] leading-tight font-bold">{h.name}</h1>
          <p className="mt-1.5 text-[15px] text-gray-600">
            {h.doctor_name} 원장 · {h.specialty}
          </p>
          <p className="mt-1.5 text-[14px]">
            <Rating rating={h.rating} count={h.review_count} />
          </p>
        </div>
        <div className="flex size-24 shrink-0 items-end justify-center overflow-hidden rounded-3xl bg-doctor-bg">
          <Image
            src={h.doctor_image}
            alt=""
            width={88}
            height={88}
            loading="eager"
            className="translate-y-1"
          />
        </div>
      </section>

      <div className="h-2 bg-page" />

      <section className="px-5 py-6">
        <h2 className="text-[18px] font-bold">병원 정보</h2>
        <dl className="mt-4 space-y-3.5 text-[15px]">
          <InfoRow icon={<MapPinIcon size={20} weight="fill" />} label="주소">
            {h.address}
          </InfoRow>
          <InfoRow icon={<ClockIcon size={20} weight="fill" />} label="진료 시간">
            {h.open_time} - {h.close_time}
            {badges.length > 0 && (
              <span className="ml-2 text-[13px] font-semibold text-brand">{badges.join(" · ")}</span>
            )}
          </InfoRow>
          {h.lunch_start && h.lunch_end && (
            <InfoRow icon={<ForkKnifeIcon size={20} weight="fill" />} label="점심 시간">
              {h.lunch_start} - {h.lunch_end}
            </InfoRow>
          )}
          <InfoRow icon={<CalendarXIcon size={20} weight="fill" />} label="휴진">
            {closedDaysText(h)}
          </InfoRow>
        </dl>
      </section>

      <div className="h-2 bg-page" />

      <section className="px-5 py-6">
        <h2 className="text-[18px] font-bold">병원 소개</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-700">{h.description}</p>
      </section>

      <BottomCTA>
        <Link
          href={`/hospitals/${h.id}/reserve`}
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-[17px] font-semibold text-white"
        >
          예약하기
        </Link>
      </BottomCTA>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt className="flex w-24 shrink-0 items-center gap-2 text-gray-500">
        <span className="text-gray-300">{icon}</span>
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-ink">{children}</dd>
    </div>
  );
}
