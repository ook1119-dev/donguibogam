"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const slides = [
  {
    href: "/hospitals",
    bg: "#D0ECF5",
    accent: "#E03131",
    title: "아플 땐 동네 병원부터!",
    sub: "진료과로 3초 만에 병원 찾기",
    icon: "/icons/hospital.png",
  },
  {
    href: "/reservations",
    bg: "#FFE8CC",
    accent: "#E8590C",
    title: "로그인 없이 간편하게",
    sub: "닉네임으로 내 예약 확인하기",
    icon: "/icons/magnifier.png",
  },
  {
    href: "/reservations",
    bg: "#D3F9D8",
    accent: "#2B8A3E",
    title: "예약 변경도 걱정 없이",
    sub: "비밀번호 4자리로 변경·취소",
    icon: "/icons/locked.png",
  },
];

// 옆으로 넘기는 배너 (오른쪽 아래에 1 / 3 표시)
export default function PromoCarousel() {
  const [index, setIndex] = useState(0);

  return (
    <section className="relative overflow-hidden rounded-[20px]">
      <div
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {slides.map((s) => (
          <Link
            key={s.sub}
            href={s.href}
            className="relative flex h-[104px] w-full shrink-0 snap-start items-center px-5"
            style={{ backgroundColor: s.bg }}
          >
            <div className="pr-24">
              <p className="text-[16px] font-bold" style={{ color: s.accent }}>
                {s.title}
              </p>
              <p className="mt-0.5 text-[18px] font-bold tracking-tight">{s.sub}</p>
            </div>
            <Image
              src={s.icon}
              alt=""
              width={76}
              height={76}
              className="absolute top-1/2 right-4 -translate-y-1/2"
            />
          </Link>
        ))}
      </div>
      <span className="pointer-events-none absolute right-3 bottom-2.5 rounded-full bg-black/35 px-2.5 py-0.5 text-[12px] text-white/80">
        <b className="text-white">{index + 1}</b> / {slides.length}
      </span>
    </section>
  );
}
