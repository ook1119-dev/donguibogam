import FixedDemoNotice from "@/components/FixedDemoNotice";

// 병원 상세, 예약하기처럼 뒤로 가기가 있는 화면들 (하단 탭 없음)
export default function SubLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="pb-[calc(28px+env(safe-area-inset-bottom))]">{children}</div>
      <FixedDemoNotice />
    </>
  );
}
