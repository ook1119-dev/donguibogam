import Image from "next/image";
import Link from "next/link";
import { departments } from "@/lib/departments";

// 진료과 아이콘 9개 + 전체보기 (5칸 x 2줄)
export default function DepartmentGrid() {
  return (
    <section className="grid grid-cols-5 gap-y-5 rounded-[20px] bg-white px-1 py-6">
      {departments.map((d) => (
        <Link
          key={d.id}
          href={`/hospitals?dept=${d.id}`}
          className="flex flex-col items-center gap-2"
        >
          <Image src={d.icon} alt="" width={52} height={52} />
          <span className="text-[14px] tracking-tight text-gray-800">{d.name}</span>
        </Link>
      ))}
      <Link href="/hospitals" className="flex flex-col items-center gap-2">
        <span className="grid size-[52px] grid-cols-2 gap-1.5 p-2" aria-hidden="true">
          <span className="rounded-md bg-gray-200" />
          <span className="rounded-md bg-gray-200" />
          <span className="rounded-md bg-gray-200" />
          <span className="rounded-md bg-gray-300" />
        </span>
        <span className="text-[14px] tracking-tight text-gray-800">전체보기</span>
      </Link>
    </section>
  );
}
