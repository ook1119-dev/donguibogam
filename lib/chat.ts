// 대화창 공통 규칙 (화면과 서버가 함께 써요)

export type ChatRole = "patient" | "doctor";

// Supabase messages 테이블 한 줄
export type Message = {
  id: number;
  sender: ChatRole;
  body: string;
  created_at: string;
};

export const MESSAGE_MAX = 500;

export function checkMessage(body: string) {
  if (body.length === 0) return "메시지를 입력해 주세요.";
  if (body.length > MESSAGE_MAX) return `메시지는 ${MESSAGE_MAX}자까지 보낼 수 있어요.`;
  return null;
}

// "오후 3:05"
export function formatChatTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
