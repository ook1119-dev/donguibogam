import Link from "next/link";
import { Suspense } from "react";
import { ThermometerIcon } from "@phosphor-icons/react/ssr";
import HospitalExplorer, { HospitalExplorerSkeleton } from "@/components/HospitalExplorer";
import PageTitle from "@/components/PageTitle";
import { getHospitals } from "@/lib/data";

export default async function HospitalsPage() {
  const hospitals = await getHospitals();

  return (
    <>
      <PageTitle
        title="병원 찾기"
        action={
          <Link
            href="/symptom-check"
            className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1.5 text-[13px] font-semibold text-brand"
          >
            <ThermometerIcon size={16} weight="fill" />
            증상으로 찾기
          </Link>
        }
      />
      {/* 주소의 ?dept= 값은 접속할 때 정해져서 Suspense로 감싸야 해요 */}
      <Suspense fallback={<HospitalExplorerSkeleton />}>
        <HospitalExplorer hospitals={hospitals} />
      </Suspense>
    </>
  );
}
