"use client";

import { useEffect, useRef } from "react";
import InlineScript from "./InlineScript";
import Logo from "./Logo";

const STORAGE_KEY = "splash-seen";

// 새 탭에서 처음 열 때만 1.2초 동안 주황 스플래시를 보여줘요.
// 같은 탭에서 새로고침하면 바로 건너뛰어요.
const skipIfSeen = `(function(){var el=document.getElementById("splash");if(!el)return;try{if(sessionStorage.getItem("${STORAGE_KEY}")){el.classList.add("splash-skip")}else{sessionStorage.setItem("${STORAGE_KEY}","1")}}catch(e){}})()`;

export default function Splash() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      ref.current?.classList.add("splash-hide");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div
        id="splash"
        ref={ref}
        className="splash fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 flex-col bg-brand text-white"
        suppressHydrationWarning
        aria-hidden="true"
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <p className="text-[22px] font-bold">동네 의사 보러 감</p>
          <Logo size="lg" />
          <p className="text-[16px]">진료과별 병원 찾기부터 예약까지 한 번에</p>
        </div>
        <div className="px-10 pb-[calc(40px+env(safe-area-inset-bottom))] text-center">
          <div className="h-[3px] w-full bg-white/30">
            <div className="splash-progress h-full w-full bg-white" />
          </div>
          <p className="mt-6 text-[15px] leading-relaxed">
            과제용 데모 서비스를
            <br />
            준비하고 있어요
          </p>
        </div>
      </div>
      <InlineScript html={skipIfSeen} />
    </>
  );
}
