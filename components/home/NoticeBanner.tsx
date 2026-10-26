"use client";

import Link from "next/link";
import { useState } from "react";
import { CaretRightIcon, MegaphoneIcon, XIcon } from "@phosphor-icons/react";

// 홈 맨 위 주황 테두리 공지 (X를 누르면 닫혀요)
export default function NoticeBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <section className="relative rounded-[20px] border-2 border-brand-light bg-white px-5 py-4">
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="공지 닫기"
        className="absolute top-3 right-3 p-1.5 text-gray-400"
      >
        <XIcon size={18} weight="bold" />
      </button>
      <h2 className="flex items-center gap-1.5 text-[17px] font-bold">
        <MegaphoneIcon size={22} weight="fill" className="text-brand" />
        <span>
          모든 병원은 <span className="text-brand">가상</span>의 병원이에요
        </span>
      </h2>
      <p className="mt-1.5 text-[14px] text-gray-600">
        과제용 데모라 실제 진료·처방이 이뤄지지 않아요.
      </p>
      <Link
        href="/more"
        className="mt-2 inline-flex items-center gap-0.5 text-[15px] font-semibold text-brand"
      >
        동의보감 이용 방법 보기
        <CaretRightIcon size={14} weight="bold" />
      </Link>
    </section>
  );
}
