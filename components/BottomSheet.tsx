"use client";

import { useEffect } from "react";
import DemoNotice from "@/components/DemoNotice";

// 화면 아래에서 올라오는 창 (바깥 어두운 곳을 누르거나 Esc를 누르면 닫혀요)
export default function BottomSheet({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // 창이 열려 있는 동안 뒤쪽 화면이 스크롤되지 않게
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 mx-auto flex w-full max-w-[480px] flex-col justify-end"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/40"
      />
      <div className="relative animate-sheet-up overflow-hidden rounded-t-3xl bg-white">
        {children}
        <div className="bg-brand-soft pb-[env(safe-area-inset-bottom)]">
          <DemoNotice />
        </div>
      </div>
    </div>
  );
}
