import Image from "next/image";
import Link from "next/link";

// '페이지를 찾을 수 없어요' 화면 내용 (app/not-found.tsx, app/(sub)/not-found.tsx에서 같이 써요)
export default function NotFoundView() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 pb-16 text-center">
      <Image src="/icons/magnifier.png" alt="" width={72} height={72} />
      <h1 className="mt-4 text-[20px] font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-[15px] text-gray-500">주소가 잘못됐거나 없는 병원·예약이에요.</p>
      <Link
        href="/"
        className="mt-6 flex h-12 items-center rounded-xl bg-brand px-6 text-[15px] font-semibold text-white"
      >
        홈으로
      </Link>
    </div>
  );
}
