-- 6.5단계: 의사와의 대화창 + 비밀번호 잠금
-- schema.sql, seed.sql 다음에 SQL Editor에서 실행하세요. 여러 번 실행해도 괜찮아요.

-- 1) 대화 메시지 --------------------------------------------------------
create table if not exists public.messages (
  id             bigint generated always as identity primary key,
  reservation_id uuid not null references public.reservations (id),
  sender         text not null check (sender in ('patient', 'doctor')),  -- 환자 / 의사
  body           text not null check (char_length(body) between 1 and 500),
  created_at     timestamptz not null default now()
);

-- 예약별로 메시지를 순서대로 빨리 찾기 위한 색인
create index if not exists messages_reservation_idx
  on public.messages (reservation_id, id);

-- 예약과 똑같이 잠가 두고, 서버(secret 키)에서만 읽고 써요.
alter table public.messages enable row level security;
revoke all on public.messages from anon, authenticated;
grant select, insert on public.messages to service_role;

-- 2) 비밀번호 여러 번 틀리면 잠시 잠그기 -------------------------------
-- 숫자 4자리는 경우의 수가 1만 개뿐이라, 5번 틀리면 10분 동안 막아요.
alter table public.reservations
  add column if not exists failed_attempts int not null default 0,
  add column if not exists locked_until timestamptz;

-- 횟수 세기는 앱 서버에서 "비교 전에 기회 1번 먼저 쓰기" 방식으로 해요 (lib/actions.ts).
-- 처음에 만들었던 DB 함수는 동시 시도를 막지 못해서 쓰지 않아요.
drop function if exists public.register_failed_attempt(uuid);
