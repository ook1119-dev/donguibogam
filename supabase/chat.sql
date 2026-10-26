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

-- 틀린 횟수 +1 (5번째면 10분 잠그고 횟수는 0으로). 동시에 여러 번 시도해도 정확히 세도록 DB 안에서 한 번에 처리해요.
-- 돌려주는 값: 잠긴 경우 잠금이 풀리는 시각, 아니면 null
create or replace function public.register_failed_attempt(rid uuid)
returns timestamptz
language sql
as $$
  update public.reservations
  set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
      locked_until    = case when failed_attempts + 1 >= 5 then now() + interval '10 minutes' else locked_until end
  where id = rid
  returning locked_until;
$$;

-- 이 함수도 서버(secret 키)만 부를 수 있어요.
revoke execute on function public.register_failed_attempt(uuid) from public, anon, authenticated;
grant execute on function public.register_failed_attempt(uuid) to service_role;
