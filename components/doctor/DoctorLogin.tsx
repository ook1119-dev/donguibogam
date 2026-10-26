"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { doctorLogin } from "@/lib/actions";

type HospitalOption = { id: number; name: string; doctor_name: string; doctor_image: string };

// 의사 모드 들어가기: 병원 고르기 + 의사 모드 코드
export default function DoctorLogin({ hospitals }: { hospitals: HospitalOption[] }) {
  const router = useRouter();
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!hospitalId || !code) return;
    setError(null);
    startTransition(async () => {
      const result = await doctorLogin(hospitalId, code);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={submit} className="px-5 pt-2 pb-10">
      <h1 className="text-[24px] font-bold">의사 모드</h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-gray-500">
        병원 쪽 화면이에요. 우리 병원 예약과 증상 메모를 보고, 환자에게 답장할 수 있어요.
        <br />
        (발표 시연용 · 코드는 만든 사람만 알아요)
      </p>

      <h2 className="mt-7 mb-3 text-[17px] font-bold">어느 병원인가요?</h2>
      <div className="grid grid-cols-2 gap-2">
        {hospitals.map((h) => {
          const selected = h.id === hospitalId;
          return (
            <button
              key={h.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setHospitalId(h.id)}
              className={`flex items-center gap-2 rounded-2xl border-2 p-2.5 text-left transition-colors ${
                selected ? "border-brand bg-brand-soft" : "border-line bg-white"
              }`}
            >
              <span className="flex size-9 shrink-0 items-end justify-center overflow-hidden rounded-lg bg-doctor-bg">
                <Image src={h.doctor_image} alt="" width={32} height={32} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold">{h.name}</span>
                <span className="block text-[12px] text-gray-500">{h.doctor_name} 원장</span>
              </span>
            </button>
          );
        })}
      </div>

      <label className="mt-7 block">
        <span className="mb-2 block text-[17px] font-bold">의사 모드 코드</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          type="password"
          autoComplete="off"
          autoCapitalize="off"
          placeholder="코드 입력 (영문·숫자)"
          className="h-13 w-full scroll-mb-40 rounded-2xl border border-line px-4 text-[16px] tracking-[0.1em] outline-none placeholder:tracking-normal placeholder:text-gray-400 focus:border-brand"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 text-[14px] font-medium text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!hospitalId || !code || pending}
        className="mt-6 h-14 w-full rounded-2xl bg-ink text-[17px] font-semibold text-white disabled:bg-gray-200 disabled:text-gray-500"
      >
        {pending ? "확인하는 중…" : "의사 모드 시작"}
      </button>
    </form>
  );
}
