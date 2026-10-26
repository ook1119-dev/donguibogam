"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { CalendarDotsIcon, MoonIcon } from "@phosphor-icons/react";
import Chip from "@/components/Chip";
import HospitalCard from "@/components/HospitalCard";
import { departments, findDepartment } from "@/lib/departments";
import { isNightCare, isWeekendCare, type Hospital } from "@/lib/hospitals";

// 병원 찾기: 주소의 ?dept=internal&night=1&weekend=1 에 맞춰 병원을 걸러서 보여줘요.
export default function HospitalExplorer({ hospitals }: { hospitals: Hospital[] }) {
  const searchParams = useSearchParams();
  const dept = findDepartment(searchParams.get("dept"))?.id ?? null;
  const night = searchParams.get("night") === "1";
  const weekend = searchParams.get("weekend") === "1";

  const filtered = hospitals.filter(
    (h) =>
      (!dept || h.department === dept) &&
      (!night || isNightCare(h)) &&
      (!weekend || isWeekendCare(h)),
  );

  // 주소만 바꾸고 서버를 다시 부르지 않아서 바로바로 바뀌어요.
  // 버튼을 연달아 빨리 눌러도 앞의 변경이 사라지지 않게, 누른 순간의 주소창 값에서 시작해요.
  function updateFilter(key: "dept" | "night" | "weekend", value: string | null) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

  // 홈에서 '가정의학과'처럼 오른쪽 끝 칩을 골라 들어오면, 그 칩이 보이게 스크롤해요.
  const chipRow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = chipRow.current;
    const activeChip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (row && activeChip) {
      row.scrollTo({ left: activeChip.offsetLeft - 20 });
    }
  }, []);

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white pb-3">
        <div ref={chipRow} className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-1">
          <Chip active={dept === null} onClick={() => updateFilter("dept", null)}>
            전체
          </Chip>
          {departments.map((d) => (
            <Chip key={d.id} active={dept === d.id} onClick={() => updateFilter("dept", d.id)}>
              {d.name}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex gap-2 px-5">
          <Toggle
            active={night}
            onClick={() => updateFilter("night", night ? null : "1")}
            icon={<MoonIcon size={15} weight="fill" />}
          >
            야간 진료
          </Toggle>
          <Toggle
            active={weekend}
            onClick={() => updateFilter("weekend", weekend ? null : "1")}
            icon={<CalendarDotsIcon size={15} weight="fill" />}
          >
            주말 진료
          </Toggle>
        </div>
      </div>

      <p className="px-5 pt-4 text-[14px] text-gray-500">
        병원 <b className="text-ink">{filtered.length}</b>곳
      </p>

      {filtered.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {filtered.map((h, i) => (
            <li key={h.id}>
              {/* 첫 화면에 보이는 위쪽 3개는 이미지를 먼저 불러와요 */}
              <HospitalCard hospital={h} eager={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-20 text-center">
          <p className="text-[16px] font-semibold">조건에 맞는 병원이 없어요</p>
          <button
            type="button"
            onClick={() => window.history.replaceState(null, "", window.location.pathname)}
            className="mt-4 rounded-full border border-line px-4 py-2 text-[14px] text-gray-600"
          >
            필터 초기화
          </button>
        </div>
      )}
    </>
  );
}

function Toggle({
  active,
  icon,
  children,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[13px] transition-colors ${
        active ? "border-brand bg-brand-soft font-semibold text-brand" : "border-line text-gray-600"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// 주소를 읽기 전(첫 화면)에 잠깐 보여주는 회색 뼈대
export function HospitalExplorerSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-2 px-5 pt-1">
        {[56, 64, 72, 96].map((w) => (
          <div key={w} className="h-10 shrink-0 rounded-full bg-gray-100" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-3 flex gap-2 px-5">
        <div className="h-8 w-24 rounded-full bg-gray-100" />
        <div className="h-8 w-24 rounded-full bg-gray-100" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 px-5 py-5">
          <div className="size-[72px] rounded-2xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 rounded bg-gray-100" />
            <div className="h-5 w-2/3 rounded bg-gray-100" />
            <div className="h-4 w-1/2 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
