// 상세 화면 아래에 고정되는 큰 버튼 영역 (데모 문구 28px 바로 위)
export default function BottomCTA({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(28px+env(safe-area-inset-bottom))] z-40 mx-auto w-full max-w-[480px] border-t border-gray-100 bg-white px-5 py-3">
      {children}
    </div>
  );
}
