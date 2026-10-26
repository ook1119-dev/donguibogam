-- 동의보감 테이블 만들기
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 [Run]을 누르세요.
-- 여러 번 실행해도 괜찮아요 (이미 있으면 건너뛰어요).

-- 1) 병원 ------------------------------------------------------------
create table if not exists public.hospitals (
  id           int primary key,
  name         text not null,
  department   text not null check (department in (
                 'internal', 'pediatrics', 'ent', 'dermatology', 'ophthalmology',
                 'orthopedics', 'dental', 'obgyn', 'family')),
  doctor_name  text not null,
  specialty    text not null,
  doctor_image text not null,
  address      text not null,
  description  text not null,
  open_time    text not null check (open_time ~ '^[0-9]{2}:[0-9]{2}$'),
  close_time   text not null check (close_time ~ '^[0-9]{2}:[0-9]{2}$'),
  lunch_start  text check (lunch_start ~ '^[0-9]{2}:[0-9]{2}$'),
  lunch_end    text check (lunch_end ~ '^[0-9]{2}:[0-9]{2}$'),
  closed_days  smallint[] not null default '{}',  -- 쉬는 요일 (0=일 … 6=토)
  rating       numeric(2, 1) not null default 0,
  review_count int not null default 0
);

-- 2) 예약 ------------------------------------------------------------
create table if not exists public.reservations (
  id            uuid primary key default gen_random_uuid(),
  hospital_id   int not null references public.hospitals (id),
  visit_type    text not null check (visit_type in ('consult', 'visit')),  -- 비대면 상담 / 방문 진료
  reserved_date date not null,
  reserved_time text not null check (reserved_time ~ '^[0-9]{2}:[0-9]{2}$'),
  symptom       text not null default '' check (char_length(symptom) <= 300),
  nickname      text not null check (char_length(nickname) between 2 and 12),
  password_hash text not null,  -- 비밀번호 4자리는 암호화해서만 저장해요
  status        text not null default 'booked' check (status in ('booked', 'cancelled')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 같은 병원·날짜·시간에는 '예약됨' 상태가 하나만 있을 수 있어요 (중복 예약 방지)
create unique index if not exists reservations_one_per_slot
  on public.reservations (hospital_id, reserved_date, reserved_time)
  where status = 'booked';

-- 닉네임으로 내 예약을 빨리 찾기 위한 색인
create index if not exists reservations_nickname_idx
  on public.reservations (nickname);

-- 3) 보안 ------------------------------------------------------------
-- 우리 앱은 Next.js 서버에서 secret 키로만 DB에 접근해요.
-- 그래도 혹시 공개 키가 새어 나가도 예약 정보는 못 보도록 잠가 둬요.
alter table public.hospitals enable row level security;
alter table public.reservations enable row level security;

-- 병원 정보는 공개 정보라 누구나 읽을 수 있어요.
drop policy if exists "hospitals are public" on public.hospitals;
create policy "hospitals are public" on public.hospitals for select using (true);

-- 예약 테이블은 정책을 만들지 않고, 공개 역할의 권한도 빼요.
revoke all on public.reservations from anon, authenticated;

-- 서버(secret 키 = service_role)에는 필요한 권한을 분명히 줘요.
grant select on public.hospitals to anon, authenticated, service_role;
grant select, insert, update on public.reservations to service_role;
