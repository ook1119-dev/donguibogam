"use client";

import { useEffect, useRef, useState } from "react";
import { BackspaceIcon } from "@phosphor-icons/react";
import BottomSheet from "@/components/BottomSheet";

// 은행 앱처럼 숫자 키패드로 비밀번호 4자리를 받는 창
// onComplete: 4자리를 다 누르면 호출돼요. 틀리면 안내 문장을, 맞으면 null을 돌려주세요.
export default function PinPad({
  title,
  description,
  onComplete,
  onClose,
}: {
  title: string;
  description?: string;
  onComplete: (pin: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  // 아주 빠르게 연달아 눌러도 숫자가 빠지지 않게, 누른 값을 바로 ref에도 적어 둬요.
  const pinRef = useRef("");

  async function press(digit: string) {
    if (pinRef.current.length >= 4) return;
    const next = pinRef.current + digit;
    pinRef.current = next;
    setPin(next);
    setError(null);
    if (next.length < 4) return;

    setChecking(true);
    const problem = await onComplete(next);
    setChecking(false);
    if (problem) {
      pinRef.current = "";
      setError(problem);
      setPin("");
      setShakeCount((n) => n + 1);
    }
  }

  function erase() {
    if (checking) return;
    pinRef.current = pinRef.current.slice(0, -1);
    setPin(pinRef.current);
  }

  // PC에서는 키보드 숫자키로도 입력할 수 있어요.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") erase();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "erase"];

  return (
    <BottomSheet label={title} onClose={onClose}>
      <div className="px-6 pt-8 pb-4 text-center">
        <h2 className="text-[20px] font-bold">{title}</h2>
        <p className={`mt-1.5 h-5 text-[14px] ${error ? "text-red-500" : "text-gray-500"}`}>
          {checking ? "확인하는 중…" : (error ?? description)}
        </p>

        <div key={shakeCount} className={`mt-6 flex justify-center gap-4 ${shakeCount ? "animate-shake" : ""}`}>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`size-4 rounded-full transition-colors ${
                i < pin.length ? "bg-brand" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 px-4 pb-4">
        {keys.map((key, i) =>
          key === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => (key === "erase" ? erase() : press(key))}
              aria-label={key === "erase" ? "지우기" : key}
              className="flex h-16 items-center justify-center rounded-2xl text-[26px] font-semibold active:bg-gray-100"
            >
              {key === "erase" ? <BackspaceIcon size={28} /> : key}
            </button>
          ),
        )}
      </div>
    </BottomSheet>
  );
}
