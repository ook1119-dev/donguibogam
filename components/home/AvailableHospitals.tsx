"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LightningIcon } from "@phosphor-icons/react";
import Chip from "@/components/Chip";
import Rating from "@/components/Rating";
import { departments, findDepartment, type DepartmentId } from "@/lib/departments";
import type { Hospital } from "@/lib/hospitals";

// 홈 아래쪽 "지금 바로 예약 가능한 병원" (칩으로 진료과를 고르면 카드가 바뀌어요)
export default function AvailableHospitals({ hospitals }: { hospitals: Hospital[] }) {
  const [dept, setDept] = useState<DepartmentId | null>(null);

  const chips = departments.filter((d) => hospitals.some((h) => h.department === d.id));
  const shown = dept ? hospitals.filter((h) => h.department === dept) : hospitals;

  return (
    <section className="pt-7 pb-8">
      <h2 className="px-5 text-[22px] font-bold tracking-tight">지금 바로 예약 가능한 병원</h2>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
        <Chip active={dept === null} onClick={() => setDept(null)}>
          전체
        </Chip>
        {chips.map((d) => (
          <Chip key={d.id} active={dept === d.id} onClick={() => setDept(d.id)}>
            {d.name}
          </Chip>
        ))}
      </div>

      <ul className="no-scrollbar mt-5 flex gap-4 overflow-x-auto px-5">
        {shown.map((h) => (
          <li key={h.id} className="w-[148px] shrink-0">
            <DoctorCard hospital={h} />
          </li>
        ))}
      </ul>

      <div className="mt-6 px-5">
        <Link
          href={dept ? `/hospitals?dept=${dept}` : "/symptom-check"}
          className="flex h-14 items-center justify-center rounded-2xl border border-line text-[17px] text-gray-700"
        >
          {dept ? `${findDepartment(dept)?.name} 병원 모두 보기` : "증상 입력하고 병원 찾기"}
        </Link>
      </div>
    </section>
  );
}

function DoctorCard({ hospital: h }: { hospital: Hospital }) {
  return (
    <Link href={`/hospitals/${h.id}`} className="block">
      <div className="relative flex h-[148px] items-end justify-center overflow-hidden rounded-2xl bg-doctor-bg">
        <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 rounded-full bg-white px-2 py-1 text-[12px] font-semibold text-brand shadow-sm">
          <LightningIcon size={13} weight="fill" />
          바로 예약
        </span>
        <Image src={h.doctor_image} alt="" width={120} height={120} className="translate-y-2" />
      </div>
      <p className="mt-3 text-[18px] font-bold">{h.doctor_name} 원장</p>
      <p className="truncate text-[14px] text-gray-500">{h.name}</p>
      <p className="mt-1 text-[14px]">
        <Rating rating={h.rating} count={h.review_count} />
      </p>
      <span className="mt-2 inline-block rounded-md bg-[#E7F5FF] px-2 py-1 text-[13px] font-medium text-specialty">
        {h.specialty}
      </span>
    </Link>
  );
}
