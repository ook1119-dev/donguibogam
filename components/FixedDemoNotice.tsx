import DemoNotice from "@/components/DemoNotice";

// 하단 탭이 없는 화면에서 맨 아래에 고정되는 데모 문구
export default function FixedDemoNotice() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] bg-brand-soft pb-[env(safe-area-inset-bottom)]">
      <DemoNotice />
    </div>
  );
}
