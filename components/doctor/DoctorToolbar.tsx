"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { doctorLogout } from "@/lib/actions";

// 의사 모드 대시보드: 10초마다 새 예약·메시지를 다시 불러오고, 로그아웃 버튼을 보여줘요.
export default function DoctorToolbar() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 10000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await doctorLogout();
          router.refresh();
        })
      }
      className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[13px] text-gray-600"
    >
      {pending ? "나가는 중…" : "로그아웃"}
    </button>
  );
}
