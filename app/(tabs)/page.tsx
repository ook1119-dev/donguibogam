import Link from "next/link";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/ssr";
import Logo from "@/components/Logo";
import AvailableHospitals from "@/components/home/AvailableHospitals";
import DepartmentGrid from "@/components/home/DepartmentGrid";
import NoticeBanner from "@/components/home/NoticeBanner";
import PromoCarousel from "@/components/home/PromoCarousel";
import QuickMenu from "@/components/home/QuickMenu";
import { getHospitals } from "@/lib/data";

export default async function HomePage() {
  const hospitals = await getHospitals();

  return (
    <div className="bg-page">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-page px-5 py-4">
        <Link href="/" aria-label="동의보감 홈">
          <Logo className="text-brand" />
        </Link>
        <Link href="/hospitals" aria-label="병원 찾기" className="p-1">
          <MagnifyingGlassIcon size={28} weight="bold" />
        </Link>
      </header>

      <div className="space-y-3 px-4 pb-8">
        <NoticeBanner />
        <DepartmentGrid />
        <QuickMenu />
        <PromoCarousel />
      </div>

      <div className="rounded-t-[28px] bg-white">
        <AvailableHospitals hospitals={hospitals} />
      </div>
    </div>
  );
}
