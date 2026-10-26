import Image from "next/image";
import Link from "next/link";

const items = [
  { title: "내 예약", href: "/reservations", icon: "/icons/clipboard.png" },
  { title: "야간 진료", href: "/hospitals?night=1", icon: "/icons/moon.png" },
  { title: "주말 진료", href: "/hospitals?weekend=1", icon: "/icons/calendar.png" },
  { title: "증상 체크", href: "/symptom-check", icon: "/icons/thermometer.png" },
];

// 홈의 네모 바로가기 카드 4개
export default function QuickMenu() {
  return (
    <section className="grid grid-cols-4 gap-2.5">
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="relative h-[118px] overflow-hidden rounded-[18px] bg-white p-3"
        >
          <span className="text-[15px] font-semibold tracking-tight">{item.title}</span>
          <Image
            src={item.icon}
            alt=""
            width={64}
            height={64}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2"
          />
        </Link>
      ))}
    </section>
  );
}
