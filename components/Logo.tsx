type LogoProps = {
  size?: "sm" | "lg";
  className?: string;
};

// 마크는 글자 크기(em)를 따라 커지고 작아져요. 좁은 휴대폰에서도 넘치지 않게 lg는 화면 폭에 맞춰 줄어요.
const sizes = {
  sm: "text-[26px] gap-[0.12em]",
  lg: "text-[clamp(44px,14vw,60px)] gap-[0.15em]",
};

// 동의보감 로고: 집(동네) 모양 안에 십자(병원) 마크 + 굵은 글자
// 색은 글자색(currentColor)을 따라가서, 흰 배경에선 주황 / 주황 배경에선 흰색으로 쓸 수 있어요.
export default function Logo({ size = "sm", className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center leading-none ${sizes[size]} ${className}`}
    >
      <LogoMark />
      <span className="font-black tracking-[-0.06em]">동의보감</span>
    </span>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-[1.15em] w-[1.15em] shrink-0 ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 21.5 24 8l16 13.5V36a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4Z"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 20.5v11M18.5 26h11"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
