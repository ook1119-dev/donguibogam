"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PaperPlaneRightIcon, UserIcon } from "@phosphor-icons/react";
import { pollMessages, postMessage } from "@/lib/actions";
import { formatChatTime, MESSAGE_MAX, type ChatRole, type Message } from "@/lib/chat";

const POLL_MS = 2500; // 새 메시지 확인 간격

// 이미 있는 메시지는 빼고 새 것만 붙여요 (보낸 직후 + 자동 확인이 겹쳐도 한 번만 보이게)
function mergeMessages(prev: Message[], incoming: Message[]) {
  const known = new Set(prev.map((m) => m.id));
  const added = incoming.filter((m) => !known.has(m.id));
  return added.length ? [...prev, ...added].sort((a, b) => a.id - b.id) : prev;
}

type Props = {
  reservationId: string;
  me: ChatRole; // 이 화면을 보는 사람
  initialMessages: Message[];
  peerName: string; // 상대방 이름 (말풍선 위)
  doctorImage: string;
  canSend: boolean;
  notice?: string; // 맨 위 안내 문구
};

// 환자와 의사가 함께 쓰는 대화창
export default function ChatRoom({
  reservationId,
  me,
  initialMessages,
  peerName,
  doctorImage,
  canSend,
  notice,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastId = messages.at(-1)?.id ?? 0;
  const lastIdRef = useRef(lastId);
  useEffect(() => {
    lastIdRef.current = lastId;
  }, [lastId]);

  // 2.5초마다 새 메시지 확인 (다른 탭을 보고 있을 땐 쉬어요)
  useEffect(() => {
    let stopped = false;
    const timer = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const result = await pollMessages(reservationId, me, lastIdRef.current);
      if (stopped) return;
      if (result.ok) setMessages((prev) => mergeMessages(prev, result.messages));
      else setError(result.error);
    }, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [reservationId, me]);

  // 메시지가 늘어나면 맨 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const result = await postMessage(reservationId, me, body);
    setSending(false);
    if (result.ok) {
      setText("");
      setMessages((prev) => mergeMessages(prev, [result.message]));
    } else {
      setError(result.error);
    }
  }

  return (
    <>
      <div className="px-4 pt-3 pb-24">
        {notice && (
          <p className="mx-auto mb-5 max-w-[320px] rounded-xl bg-page px-3 py-2 text-center text-[12px] leading-relaxed text-gray-500">
            {notice}
          </p>
        )}
        {messages.length === 0 && (
          <p className="py-10 text-center text-[14px] text-gray-400">
            아직 대화가 없어요. 첫 메시지를 보내 보세요.
          </p>
        )}

        <ul className="space-y-3">
          {messages.map((m, i) => {
            const mine = m.sender === me;
            const firstOfGroup = messages[i - 1]?.sender !== m.sender;
            return (
              <li key={m.id} className={`flex items-start gap-2 ${mine ? "justify-end" : ""}`}>
                {!mine && (
                  <div className="size-9 shrink-0">
                    {firstOfGroup && <Avatar sender={m.sender} doctorImage={doctorImage} />}
                  </div>
                )}
                <div className={`flex max-w-[75%] flex-col ${mine ? "items-end" : "items-start"}`}>
                  {!mine && firstOfGroup && (
                    <span className="mb-1 text-[12px] text-gray-500">{peerName}</span>
                  )}
                  <div className={`flex items-end gap-1.5 ${mine ? "flex-row-reverse" : ""}`}>
                    <p
                      className={`rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap ${
                        mine ? "rounded-tr-md bg-brand text-white" : "rounded-tl-md bg-page text-ink"
                      }`}
                    >
                      {m.body}
                    </p>
                    <time className="shrink-0 text-[11px] text-gray-400">
                      {formatChatTime(m.created_at)}
                    </time>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {/* 아래 고정된 입력창에 가리지 않게 여백(scroll-mb)을 두고 스크롤해요 */}
        <div ref={bottomRef} className="scroll-mb-28" />
      </div>

      <div className="fixed inset-x-0 bottom-[calc(28px+env(safe-area-inset-bottom))] z-40 mx-auto w-full max-w-[480px] border-t border-gray-100 bg-white px-3 py-2.5">
        {error && (
          <p role="alert" className="mb-1.5 px-1 text-[13px] text-red-500">
            {error}
          </p>
        )}
        {canSend ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MESSAGE_MAX))}
              onKeyDown={(e) => {
                // PC에서는 Enter로 보내기 (한글 조합 중 Enter는 무시해서 두 번 보내지지 않게)
                const isPC = window.matchMedia("(pointer: fine)").matches;
                if (isPC && e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="메시지를 입력하세요"
              className="field-sizing-content max-h-28 min-h-11 flex-1 resize-none rounded-2xl bg-page px-4 py-2.5 text-[15px] outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              aria-label="보내기"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors disabled:bg-gray-200"
            >
              <PaperPlaneRightIcon size={20} weight="fill" />
            </button>
          </form>
        ) : (
          <p className="py-2 text-center text-[14px] text-gray-400">
            취소된 예약이라 메시지를 보낼 수 없어요
          </p>
        )}
      </div>
    </>
  );
}

function Avatar({ sender, doctorImage }: { sender: ChatRole; doctorImage: string }) {
  if (sender === "doctor") {
    return (
      <div className="flex size-9 items-end justify-center overflow-hidden rounded-full bg-doctor-bg">
        <Image src={doctorImage} alt="" width={34} height={34} />
      </div>
    );
  }
  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-400">
      <UserIcon size={20} weight="fill" />
    </div>
  );
}
