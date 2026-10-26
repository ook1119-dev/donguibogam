"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  HospitalIcon,
  HouseIcon,
  ListIcon,
} from "@phosphor-icons/react";

const tabs = [
  { href: "/", label: "홈", Icon: HouseIcon },
  { href: "/hospitals", label: "병원 찾기", Icon: HospitalIcon },
  { href: "/reservations", label: "예약 내역", Icon: FileTextIcon },
  { href: "/more", label: "더 보기", Icon: ListIcon },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[12px] ${
                  active ? "font-semibold text-ink" : "text-gray-400"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={26}
                  weight="fill"
                  className={active ? "text-ink" : "text-[#CACED2]"}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
