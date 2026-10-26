import { InfoIcon } from "@phosphor-icons/react/ssr";

// 높이를 28px(h-7)로 고정해서, 그 위에 올라가는 버튼 위치를 계산하기 쉽게 했어요.
export default function DemoNotice() {
  return (
    <p className="flex h-7 items-center justify-center gap-1 bg-brand-soft text-[11px] font-medium text-brand">
      <InfoIcon size={13} weight="fill" />
      과제용 데모이며 실제 진료 서비스가 아닙니다
    </p>
  );
}
