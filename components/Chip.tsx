// 진료과 고르는 둥근 버튼 (선택되면 검정)
type ChipProps = React.ComponentProps<"button"> & { active?: boolean };

export default function Chip({ active = false, className = "", ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`h-10 shrink-0 rounded-full border px-4 text-[16px] transition-colors ${
        active
          ? "border-ink bg-ink font-medium text-white"
          : "border-line bg-white text-gray-600"
      } ${className}`}
      {...props}
    />
  );
}
