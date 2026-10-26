import BottomNav from "@/components/BottomNav";
import DemoNotice from "@/components/DemoNotice";

// 홈 / 병원 찾기 / 예약 내역 / 더 보기: 하단 탭이 있는 화면들
export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="pb-[calc(92px+env(safe-area-inset-bottom))]">
        {children}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px]">
        <DemoNotice />
        <BottomNav />
      </div>
    </>
  );
}
