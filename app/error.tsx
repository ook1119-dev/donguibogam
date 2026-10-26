"use client"; // 오류 화면은 브라우저에서 동작해야 해요

import Link from "next/link";
import { WarningCircleIcon } from "@phosphor-icons/react";
import FixedDemoNotice from "@/components/FixedDemoNotice";

// DB 연결 실패처럼 예상 못 한 오류가 나면 이 화면을 보여줘요.
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <>
      <div className="flex min-h-dvh flex-col items-center justify-center px-8 pb-16 text-center">
        <WarningCircleIcon size={56} weight="fill" className="text-brand" />
        <h1 className="mt-4 text-[20px] font-bold">잠시 문제가 생겼어요</h1>
        <p className="mt-2 text-[15px] text-gray-500">잠시 후 다시 시도해 주세요.</p>
        {error instanceof Error && (
          <p className="mt-3 rounded-lg bg-page px-3 py-2 text-[12px] break-all text-gray-400">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => retry()}
            className="h-12 rounded-xl bg-brand px-5 text-[15px] font-semibold text-white"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="flex h-12 items-center rounded-xl border border-line px-5 text-[15px] text-gray-700"
          >
            홈으로
          </Link>
        </div>
      </div>
      <FixedDemoNotice />
    </>
  );
}
