import Image from "next/image";
import Link from "next/link";
import { CalendarDotsIcon, ClockIcon, MoonIcon } from "@phosphor-icons/react/ssr";
import Rating from "@/components/Rating";
import { findDepartment } from "@/lib/departments";
import { isNightCare, isWeekendCare, type Hospital } from "@/lib/hospitals";

// 병원 찾기 목록의 병원 한 줄
export default function HospitalCard({
  hospital: h,
  eager = false,
}: {
  hospital: Hospital;
  eager?: boolean;
}) {
  return (
    <Link href={`/hospitals/${h.id}`} className="flex gap-4 px-5 py-5">
      <div className="flex size-[72px] shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-doctor-bg">
        <Image
          src={h.doctor_image}
          alt=""
          width={64}
          height={64}
          loading={eager ? "eager" : undefined}
          className="translate-y-1"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-brand">
          {findDepartment(h.department)?.name}
        </p>
        <h3 className="truncate text-[18px] font-bold">{h.name}</h3>
        <p className="mt-0.5 text-[14px] text-gray-500">
          {h.doctor_name} 원장 · {h.specialty}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-gray-500">
          <Rating rating={h.rating} count={h.review_count} />
          <span className="text-gray-300">|</span>
          <span className="truncate">{h.address}</span>
        </div>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          <Tag icon={<ClockIcon size={13} weight="fill" />}>
            {h.open_time} - {h.close_time}
          </Tag>
          {isNightCare(h) && <Tag icon={<MoonIcon size={13} weight="fill" />}>야간 진료</Tag>}
          {isWeekendCare(h) && (
            <Tag icon={<CalendarDotsIcon size={13} weight="fill" />}>주말 진료</Tag>
          )}
        </ul>
      </div>
    </Link>
  );
}

function Tag({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1 rounded-md bg-[#F4F5F7] px-2 py-1 text-[12px] text-gray-600">
      <span className="text-gray-400">{icon}</span>
      {children}
    </li>
  );
}
