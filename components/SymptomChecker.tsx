"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PhoneIcon, WarningIcon } from "@phosphor-icons/react";
import { findDepartment } from "@/lib/departments";
import { recommendDepartments } from "@/lib/symptoms";

const examples = [
  "콧물이 나고 기침해요",
  "목이 아파요",
  "배가 아프고 설사해요",
  "허리가 아파요",
  "여드름이 심해요",
  "눈이 충혈됐어요",
  "사랑니가 아파요",
  "아이가 열이 나요",
];

// 증상을 적으면 바로 아래에 추천 진료과가 나와요.
export default function SymptomChecker({ hospitalCounts }: { hospitalCounts: Record<string, number> }) {
  const [text, setText] = useState("");
  const { emergency, results } = recommendDepartments(text);

  return (
    <div className="px-5 pt-2 pb-10">
      <h1 className="text-[24px] leading-snug font-bold">
        어디가 불편하세요?
        <br />
        <span className="text-brand">진료과를 추천</span>해 드릴게요
      </h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 200))}
        rows={3}
        placeholder="예) 아이가 어제부터 열이 나고 기침을 해요"
        className="mt-5 w-full resize-none rounded-2xl border border-line p-4 text-[16px] outline-none placeholder:text-gray-400 focus:border-brand"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setText(ex)}
            className="rounded-full bg-page px-3 py-1.5 text-[13px] text-gray-600"
          >
            {ex}
          </button>
        ))}
      </div>

      {emergency && (
        <div role="alert" className="mt-6 rounded-2xl bg-red-50 p-4">
          <p className="flex items-center gap-1.5 text-[16px] font-bold text-red-600">
            <WarningIcon size={20} weight="fill" />
            응급 상황일 수 있어요
          </p>
          <p className="mt-1 text-[14px] text-red-600/80">
            증상이 심하면 진료 예약보다 119에 먼저 연락하세요.
          </p>
          <a
            href="tel:119"
            className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-500 px-4 text-[14px] font-semibold text-white"
          >
            <PhoneIcon size={16} weight="fill" />
            119 전화하기
          </a>
        </div>
      )}

      {results.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 text-[17px] font-bold">이런 진료과를 추천해요</h2>
          <ul className="space-y-3">
            {results.map((r, i) => {
              const dept = findDepartment(r.dept);
              const count = hospitalCounts[r.dept] ?? 0;
              return (
                <li
                  key={r.dept}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 ${
                    i === 0 ? "border-brand-light bg-brand-soft/50" : "border-gray-100"
                  }`}
                >
                  {dept && <Image src={dept.icon} alt="" width={44} height={44} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] font-bold">{dept?.name}</p>
                    <p className="text-[13px] text-gray-600">{r.reason}</p>
                    {r.matched.length > 0 && (
                      <p className="mt-1 text-[12px] text-gray-400">
                        {r.matched.map((m) => `'${m}'`).join(", ")} 때문에 추천했어요
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/hospitals?dept=${r.dept}`}
                    className={`shrink-0 rounded-xl px-3 py-2 text-[13px] font-semibold ${
                      i === 0 ? "bg-brand text-white" : "bg-page text-gray-700"
                    }`}
                  >
                    병원 {count}곳
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-[12px] leading-relaxed text-gray-400">
            단어를 보고 고른 참고용 추천이에요. 정확한 진단은 의사에게 받으세요.
          </p>
        </section>
      )}
    </div>
  );
}
