"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LockKeyIcon } from "@phosphor-icons/react";
import BottomCTA from "@/components/BottomCTA";
import BottomSheet from "@/components/BottomSheet";
import PinPad from "@/components/PinPad";
import { cancelReservation, verifyReservationPassword } from "@/lib/actions";

// 예약 상세 화면 아래 버튼들: 비밀번호 확인 → 날짜·시간 변경 / 예약 취소
export default function ReservationActions({
  id,
  hospitalId,
  unlocked,
  changeable,
  summary,
}: {
  id: string;
  hospitalId: number;
  unlocked: boolean; // 비밀번호를 이미 확인했는지
  changeable: boolean; // 다가오는 예약인지 (지난·취소된 예약은 못 바꿔요)
  summary: string;
}) {
  const router = useRouter();
  const [sheet, setSheet] = useState<"pin" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!changeable) {
    return (
      <BottomCTA>
        <Link
          href={`/hospitals/${hospitalId}/reserve`}
          className="flex h-14 w-full items-center justify-center rounded-2xl border border-line text-[16px] font-semibold text-gray-700"
        >
          이 병원 다시 예약하기
        </Link>
      </BottomCTA>
    );
  }

  function cancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelReservation(id);
      if (result.ok) {
        setSheet(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <BottomCTA>
        {unlocked ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSheet("cancel")}
              className="h-14 flex-1 rounded-2xl border border-line text-[16px] font-semibold text-gray-700"
            >
              예약 취소
            </button>
            <Link
              href={`/reservations/${id}/edit`}
              className="flex h-14 flex-[2] items-center justify-center rounded-2xl bg-brand text-[16px] font-semibold text-white"
            >
              날짜·시간 변경
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSheet("pin")}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[16px] font-semibold text-white"
          >
            <LockKeyIcon size={20} weight="fill" />
            비밀번호 입력하고 변경·취소하기
          </button>
        )}
      </BottomCTA>

      {sheet === "pin" && (
        <PinPad
          title="비밀번호 4자리를 입력해 주세요"
          description="예약할 때 정한 숫자 4자리예요"
          onClose={() => setSheet(null)}
          onComplete={async (pin) => {
            const result = await verifyReservationPassword(id, pin);
            if (!result.ok) return result.error;
            setSheet(null);
            router.refresh(); // 잠금이 풀린 화면으로 다시 그리기
            return null;
          }}
        />
      )}

      {sheet === "cancel" && (
        <BottomSheet label="예약 취소" onClose={() => setSheet(null)}>
          <div className="px-6 pt-8 pb-5">
            <h2 className="text-[20px] font-bold">예약을 취소할까요?</h2>
            <p className="mt-2 text-[15px] text-gray-600">{summary}</p>
            <p className="mt-1 text-[14px] text-gray-400">취소한 예약은 되돌릴 수 없어요.</p>
            {error && (
              <p role="alert" className="mt-3 text-[14px] font-medium text-red-500">
                {error}
              </p>
            )}
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setSheet(null)}
                className="h-14 flex-1 rounded-2xl bg-gray-100 text-[16px] font-semibold text-gray-700"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={pending}
                className="h-14 flex-1 rounded-2xl bg-red-500 text-[16px] font-semibold text-white disabled:opacity-60"
              >
                {pending ? "취소하는 중…" : "예약 취소하기"}
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
