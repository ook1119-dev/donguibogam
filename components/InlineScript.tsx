// 화면이 그려지기 전에 바로 실행되는 작은 스크립트 (Next.js 공식 문서의 방법)
// 브라우저에서 다시 그릴 때는 text/plain이라 실행되지 않아요.
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
