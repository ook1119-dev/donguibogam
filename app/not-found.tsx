import FixedDemoNotice from "@/components/FixedDemoNotice";
import NotFoundView from "@/components/NotFoundView";

// 아예 없는 주소로 들어왔을 때 (예: /abc)
export default function NotFound() {
  return (
    <>
      <NotFoundView />
      <FixedDemoNotice />
    </>
  );
}
