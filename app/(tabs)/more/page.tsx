import Image from "next/image";
import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/ssr";
import Logo from "@/components/Logo";
import PageTitle from "@/components/PageTitle";

const menus = [
  { href: "/symptom-check", icon: "/icons/thermometer.png", title: "증상으로 진료과 찾기", sub: "어디로 가야 할지 모를 때" },
  { href: "/reservations", icon: "/icons/clipboard.png", title: "내 예약 조회", sub: "닉네임으로 찾고 비밀번호로 변경·취소" },
  { href: "/doctor", icon: "/icons/family.png", title: "의사 모드 (병원용)", sub: "발표 시연용 · 환자 예약을 보고 답장해요" },
];

const steps = [
  "병원 찾기에서 진료과를 골라요",
  "날짜·시간과 증상을 적고 닉네임 + 비밀번호 4자리로 예약해요",
  "예약 내역에서 닉네임으로 내 예약을 찾아요",
  "비밀번호를 확인하면 날짜 변경·취소, 의사와 대화를 할 수 있어요",
];

export default function MorePage() {
  return (
    <>
      <PageTitle title="더 보기" />

      <section className="mx-5 rounded-2xl bg-page p-5">
        <Logo className="text-brand" />
        <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
          <b>동의보감</b>은 <b>&lsquo;동네 의사 보러 감&rsquo;</b>의 줄임말이에요. 우리 동네 병원을
          진료과별로 찾고, 로그인 없이 닉네임과 비밀번호 4자리로 예약을 관리하는 과제용 데모
          앱이에요.
        </p>
      </section>

      <ul className="mt-4 divide-y divide-gray-100">
        {menus.map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="flex items-center gap-4 px-5 py-4">
              <Image src={m.icon} alt="" width={40} height={40} />
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold">{m.title}</p>
                <p className="text-[13px] text-gray-500">{m.sub}</p>
              </div>
              <CaretRightIcon size={20} className="shrink-0 text-gray-400" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="h-2 bg-page" />

      <section className="px-5 py-6">
        <h2 className="text-[18px] font-bold">이용 방법</h2>
        <ol className="mt-4 space-y-3">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-[15px]">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[13px] font-bold text-brand">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </section>

      <div className="h-2 bg-page" />

      <section className="px-5 py-6 text-[14px] leading-relaxed text-gray-600">
        <h2 className="text-[18px] font-bold text-ink">꼭 알아 두세요</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>과제용 데모예요. 모든 병원과 의사는 가상이고 실제 진료·처방이 이뤄지지 않아요.</li>
          <li>이름·연락처 같은 개인정보는 적지 마세요.</li>
          <li>응급 상황이면 바로 119에 연락하세요.</li>
        </ul>
        <p className="mt-5 text-[12px] text-gray-400">
          아이콘: Microsoft Fluent Emoji (MIT), Phosphor Icons (MIT) · 글꼴: Pretendard (OFL)
        </p>
      </section>
    </>
  );
}
