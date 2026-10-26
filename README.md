# 동의보감 · 동네 의사 보러 감

> 과제용 데모이며 실제 진료 서비스가 아닙니다. 모든 병원과 의사는 가상입니다.

우리 동네 병원을 **진료과별로 찾고**, 로그인 없이 **닉네임 + 비밀번호 4자리**로 상담·진료 예약을
등록·조회·변경·취소하는 모바일 웹 앱입니다. 예약한 환자는 **대화창**에서 의사와 메시지를 주고받을 수 있고,
병원은 **의사 모드**에서 예약과 증상 메모를 보고 답장합니다.

- 배포 주소: (배포 후 추가)
- 연세대학교 과제 2 「AI와 함께 만들기: Vibe Coding 웹 애플리케이션」 제출물

## 주요 기능

| 기능 | 설명 |
|---|---|
| 병원 찾기 | 가상 병원 10곳을 진료과(9개)·야간 진료·주말 진료로 필터 |
| 증상으로 진료과 찾기 | 증상 글에서 단어를 찾아 진료과 추천, 응급 증상이면 119 안내 |
| 예약하기 | 비대면 상담/방문 진료, 날짜(2주), 30분 단위 시간, 증상 메모, 닉네임, 비밀번호 4자리 |
| 내 예약 조회 | 닉네임으로 다가오는/지난/취소된 예약 조회 (증상 메모는 숨김) |
| 변경·취소 | 비밀번호 확인 후 날짜·시간 변경, 예약 취소 |
| 대화창 | 비밀번호 확인 후 의사와 메시지 주고받기 (2.5초마다 새 메시지 확인) |
| 의사 모드 | 병원 선택 + 코드로 로그인 → 우리 병원 예약·증상 메모 확인, 답장 |

## 기술 구조

- **Next.js 16** (App Router, Server Actions, Cache Components) · TypeScript · Tailwind CSS 4
- **Supabase (PostgreSQL)**: `hospitals`, `reservations`, `messages` 테이블
- **Vercel** 배포

```
브라우저 ──(Server Action)──▶ Next.js 서버 ──(secret 키)──▶ Supabase
                                   │
                    입력 검사·비밀번호 확인·권한 확인은 모두 서버에서
```

### 데이터를 안전하게 다루는 방법

- 브라우저는 DB에 직접 접근하지 않아요. Supabase secret 키는 서버에서만 쓰고(`server-only`), 모든 테이블에 RLS를 켜 두었습니다.
- 비밀번호는 bcrypt로 암호화해 저장하고, **5번 틀리면 10분 잠금**(DB 함수로 횟수를 정확히 셈).
- 비밀번호를 맞히면 1시간짜리 **서명된 httpOnly 쿠키**를 발급해 변경·취소·대화 권한을 확인합니다.
- 같은 병원·날짜·시간에는 예약이 하나만 들어가도록 **DB 고유 색인**으로 막습니다 (동시 예약 시 한 명만 성공).
- 예약 목록에는 건강 정보(증상 메모)를 보여주지 않고, 비밀번호 확인 후에만 보여줍니다.
- 날짜·시간은 서버 위치와 상관없이 **한국 시간(Asia/Seoul)** 기준으로 계산합니다.

## 폴더 구조

```
app/
  (tabs)/            하단 탭이 있는 화면: 홈, 병원 찾기, 예약 내역, 더 보기
  (sub)/             뒤로 가기가 있는 화면: 병원 상세, 예약하기, 예약 상세·변경·대화창, 의사 모드, 증상 찾기
components/          화면 부품 (예약 폼, 날짜·시간 선택, 비밀번호 키패드, 대화창 등)
lib/
  data.ts            DB 읽기 (서버 전용)
  actions.ts         예약·변경·취소·대화·의사 로그인 (Server Actions)
  access.ts          서명된 쿠키로 권한 확인
  schedule.ts        예약 가능한 날짜·시간 규칙 (한국 시간)
  symptoms.ts        증상 → 진료과 추천 규칙
supabase/
  schema.sql         테이블 만들기
  seed.sql           가상 병원 10곳
  chat.sql           대화 메시지 + 비밀번호 잠금
```

## 직접 실행하기

1. `npm install`
2. Supabase 프로젝트를 만들고 SQL Editor에서 `supabase/schema.sql` → `seed.sql` → `chat.sql` 순서로 실행
3. `.env.example`을 참고해 `.env.local` 작성
   - `SUPABASE_URL`, `SUPABASE_SECRET_KEY`: Supabase 대시보드
   - `DOCTOR_CODE`: 의사 모드 로그인 코드 (직접 정함)
4. `npm run dev` → http://localhost:3000

## 출처

- 아이콘: [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT), [Phosphor Icons](https://phosphoricons.com) (MIT)
- 글꼴: [Pretendard](https://github.com/orioncactus/pretendard) (OFL)
