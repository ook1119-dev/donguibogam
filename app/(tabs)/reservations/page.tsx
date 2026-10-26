import Image from "next/image";
import Link from "next/link";
import Form from "next/form";
import { Suspense } from "react";
import PageTitle from "@/components/PageTitle";
import ReservationCard from "@/components/reservations/ReservationCard";
import { getHospitals, getReservationsByNickname } from "@/lib/data";
import { checkNickname, reservationState } from "@/lib/reservations";
import { seoulNow } from "@/lib/schedule";

export default function ReservationsPage({ searchParams }: PageProps<"/reservations">) {
  return (
    <>
      <PageTitle title="예약 내역" />
      {/* 주소의 ?nickname= 값은 접속할 때 정해져서 Suspense로 감싸요 */}
      <Suspense fallback={<ListSkeleton />}>
        <ReservationsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ReservationsContent({
  searchParams,
}: {
  searchParams: PageProps<"/reservations">["searchParams"];
}) {
  const { nickname } = await searchParams;
  const nick = typeof nickname === "string" ? nickname.trim() : "";

  return (
    <>
      {/* 조회 버튼을 누르면 /reservations?nickname=입력값 으로 이동해요 */}
      <Form action="/reservations" replace className="flex gap-2 px-5">
        <input
          key={nick}
          name="nickname"
          defaultValue={nick}
          placeholder="예약할 때 쓴 닉네임"
          maxLength={12}
          autoComplete="off"
          required
          className="h-12 min-w-0 flex-1 rounded-2xl border border-line px-4 text-[16px] outline-none placeholder:text-gray-400 focus:border-brand"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-2xl bg-ink px-5 text-[15px] font-semibold text-white"
        >
          조회
        </button>
      </Form>

      {!nick ? (
        <Guide />
      ) : checkNickname(nick) ? (
        <Message title="닉네임을 다시 확인해 주세요" text={checkNickname(nick)!} />
      ) : (
        <ReservationList nickname={nick} />
      )}
    </>
  );
}

async function ReservationList({ nickname }: { nickname: string }) {
  const [reservations, hospitals] = await Promise.all([
    getReservationsByNickname(nickname),
    getHospitals(),
  ]);

  if (reservations.length === 0) {
    return (
      <Message
        title={`'${nickname}' 닉네임의 예약이 없어요`}
        text="예약할 때 쓴 닉네임과 똑같이 입력했는지 확인해 주세요."
        action={{ href: "/hospitals", label: "병원 찾아 예약하기" }}
      />
    );
  }

  const now = seoulNow();
  const withState = reservations.map((r) => ({ r, state: reservationState(r, now) }));
  const upcoming = withState.filter((x) => x.state === "upcoming").reverse(); // 가까운 예약부터
  const past = withState.filter((x) => x.state === "past");
  const cancelled = withState.filter((x) => x.state === "cancelled");

  const groups = [
    { title: "다가오는 예약", items: upcoming },
    { title: "지난 예약", items: past },
    { title: "취소된 예약", items: cancelled },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8 px-5 pt-7 pb-6">
      <p className="text-[14px] text-gray-500">
        <b className="text-ink">{nickname}</b>님의 예약 {reservations.length}건
      </p>
      {groups.map((g) => (
        <section key={g.title}>
          <h2 className="mb-3 text-[17px] font-bold">
            {g.title} <span className="text-brand">{g.items.length}</span>
          </h2>
          <ul className="space-y-3">
            {g.items.map(({ r, state }) => (
              <li key={r.id}>
                <ReservationCard
                  reservation={r}
                  hospital={hospitals.find((h) => h.id === r.hospital_id)}
                  state={state}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Guide() {
  return (
    <div className="px-8 py-16 text-center">
      <Image src="/icons/magnifier.png" alt="" width={72} height={72} className="mx-auto" />
      <p className="mt-4 text-[17px] font-semibold">예약할 때 입력한 닉네임으로 찾아요</p>
      <p className="mt-1.5 text-[14px] text-gray-500">
        비밀번호는 예약을 바꾸거나 취소할 때만 필요해요.
      </p>
    </div>
  );
}

function Message({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="px-8 py-16 text-center">
      <p className="text-[17px] font-semibold">{title}</p>
      <p className="mt-1.5 text-[14px] text-gray-500">{text}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex h-11 items-center rounded-xl border border-line px-5 text-[15px] text-gray-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="animate-pulse px-5">
      <div className="h-12 rounded-2xl bg-gray-100" />
      <div className="mt-8 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-[92px] rounded-2xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
