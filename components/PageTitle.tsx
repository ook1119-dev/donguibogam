// 탭 화면 맨 위의 큰 제목 (예: "예약 내역", "더 보기")
export default function PageTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between px-6 pt-10 pb-6">
      <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
      {action}
    </header>
  );
}
