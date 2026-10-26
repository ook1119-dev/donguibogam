import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import Splash from "@/components/Splash";

export const metadata: Metadata = {
  title: "동의보감 · 동네 의사 보러 감",
  description: "우리 동네 병원을 진료과별로 찾고 예약하는 과제용 데모 앱",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="bg-canvas text-ink antialiased">
        {/* PC에서는 KNOCK처럼 가운데에 모바일 폭(최대 480px) 화면만 보여줘요 */}
        <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-white shadow-[0_0_24px_rgba(0,0,0,0.05)]">
          {children}
        </div>

        <Splash />
      </body>
    </html>
  );
}
