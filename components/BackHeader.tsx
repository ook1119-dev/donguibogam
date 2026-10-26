"use client";

import { useRouter } from "next/navigation";
import { CaretLeftIcon } from "@phosphor-icons/react";

// 상세 화면 맨 위 '뒤로 가기' 줄
export default function BackHeader({
  title,
  fallbackHref = "/",
}: {
  title?: string;
  fallbackHref?: string;
}) {
  const router = useRouter();

  function goBack() {
    // 주소를 직접 입력해서 들어왔으면 돌아갈 곳이 없으니 fallbackHref로 보내요.
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-1 bg-white px-2">
      <button type="button" onClick={goBack} aria-label="뒤로 가기" className="p-2">
        <CaretLeftIcon size={26} weight="bold" />
      </button>
      {title && <h1 className="truncate text-[18px] font-semibold">{title}</h1>}
    </header>
  );
}
