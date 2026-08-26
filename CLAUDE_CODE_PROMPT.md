# Claude Code 작업 지시문 — KDVA Casey Chapter 창설식 RSVP

> **사용법**
> VS Code에서 빈 폴더를 열고 터미널에 `claude`를 실행한 뒤, 이 문서 전체를
> 붙여넣으십시오. 앞에 다음 한 줄을 덧붙이면 됩니다.
>
> "아래 명세대로 프로젝트를 만들어 줘. 단계별로 진행하고 각 단계가 끝나면
> 확인을 받은 뒤 다음으로 넘어가."

---

## 1. 무엇을 만드는가

2026년 9월 16일(수) 캠프 케이시 워리어 클럽에서 열리는 **KDVA Casey Chapter
창설식**의 참석 사전등록(RSVP) 웹앱.

포스터에 인쇄된 QR을 미군 장병이 휴대폰으로 스캔 → 등록 → 끝.

**범위를 좁게 유지하는 것이 이 프로젝트의 요구사항이다.** 참석자 개인 QR 발급,
현장 QR 스캔, 입장 체크인은 **만들지 않는다.** 포스터의 QR은 등록 페이지로
가는 통로일 뿐이며, 이 앱의 목적은 오직 하나다.

> 행사 전에 **몇 명이 오는지 파악해서 식사를 준비하는 것.**

행사 당일 입구에는 어떤 시스템도 두지 않는다. 이름을 대면 들어간다. 등록하지
않은 사람도 들어간다.

---

## 2. 기술 스택

- **Next.js 15 (App Router) + TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Postgres) — 데이터 저장
- 배포: **Vercel** (GitHub 연동, main 브랜치 push 시 자동 배포)
- 패키지 매니저: pnpm

### 반드시 지킬 것

- **Supabase service role 키와 관리자 PIN은 클라이언트 번들에 절대 포함하지
  말 것.** 모두 서버 측 Route Handler에서만 사용하고 `process.env`로 읽는다.
  (기존 정적 버전은 키와 PIN이 페이지 소스에 노출되어 있었고, 이번 재작성의
  핵심 목적이 이 문제의 해결이다.)
- 외부 UI 라이브러리(shadcn 등)를 끌어오지 말 것. 화면이 3개뿐이며 디자인
  토큰이 아래에 지정되어 있다.
- QR 생성·스캔 라이브러리는 **필요 없다.** 설치하지 말 것.
- 참석자 로그인·인증 없음. 익명으로 등록한다.

---

## 3. 데이터 모델

Supabase SQL Editor에서 실행할 마이그레이션을 `supabase/schema.sql`로 작성한다.

```sql
create table public.rsvps (
  id               bigint generated always as identity primary key,
  event            text        not null default 'casey-2026-09-16',
  name             text        not null,
  affiliation      text,
  unit             text,
  guests           int         not null default 0,
  email            text,
  wants_membership boolean     not null default false,
  created_at       timestamptz not null default now()
);

create index rsvps_event_created_idx on public.rsvps (event, created_at desc);

alter table public.rsvps enable row level security;
-- 정책은 두지 않는다. 모든 접근은 service role 키를 쓰는 서버 라우트를 통한다.
```

---

## 4. 화면 명세 (3개)

모든 화면 상단에 포스터와 동일한 헤더 블록(7절)을 둔다.

### 4.1 `/` — 등록 폼

| 필드 | 형태 | 필수 | 비고 |
|---|---|---|---|
| Name | text | ○ | 2자 미만이면 등록 불가 |
| I am | select | ○ | U.S. Soldier / KATUSA / ROK military / DoD civilian / Family member / Guest |
| Unit | text | ✕ | |
| Guests with you | select 0–5 | ○ | 기본값 0 |
| Email | email | ✕ | 리마인더 발송용 |
| Send me information about joining KDVA | checkbox | ✕ | |

제출 버튼: `COUNT ME IN`
제출 중에는 `SAVING…`으로 바꾸고 비활성화. 실패 시 입력값을 유지한 채 오류 표시.

**등록 마감(2026-09-04) 이후 동작**: 폼을 막지 말 것. 안내문만
"Registration has closed, but you are still welcome to walk in."으로 바꾸고
등록은 계속 받는다. 마감은 식사 인원 파악용이지 참석 요건이 아니다.

### 4.2 `/thanks` — 확인 화면

등록 직후 이동한다. 티켓도 코드도 QR도 없다.

- 제목: `YOU'RE ON THE LIST`
- 동반 인원이 있으면 "We have you down for N people."
- `ADD TO CALENDAR` 버튼 → .ics 다운로드
  (Asia/Seoul, 2026-09-16 17:30–19:30, 장소 "Warrior Club, Camp Casey")
- `RSVP FOR SOMEONE ELSE` 버튼 → `/`로 이동
- 하단에 행사 정보 문안(8절)

### 4.3 `/staff` — 명단

PIN 입력 화면 → 통과 시 명단.

PIN 검증은 **서버에서** 한다. `POST /api/staff/login`에 PIN을 보내고,
성공 시 httpOnly 쿠키 세션(만료 12시간)을 심는다. 클라이언트 코드 어디에도
PIN 값이 존재해서는 안 된다.

구성:

- 상단 통계 3개
  - `RSVPS` — 등록 건수
  - `EXPECTED` — 본인 + 동반 인원 합계 (**케이터링에 넘길 숫자**)
  - `MEMBERSHIP` — 가입 정보 요청 체크 인원
- `FIND SOMEONE` 검색창 — 이름·부대 부분 일치
- 명단 목록 — 이름(+동반), 소속, 부대, 등록 시각
- `EXPORT CSV` — 전체 명단. UTF-8 BOM 포함(엑셀 한글 깨짐 방지).
  컬럼: Name, Affiliation, Unit, Guests, Email, Membership interest, RSVP time

읽기 전용 화면이다. 수정·삭제 기능은 만들지 않는다.

---

## 5. API 라우트

전부 Route Handler(`app/api/**/route.ts`)로 작성하고 service role 키를 사용한다.

| 메서드 | 경로 | 인증 | 동작 |
|---|---|---|---|
| POST | `/api/rsvp` | 없음 | 등록 생성 |
| POST | `/api/staff/login` | 없음 | PIN 검증 → 세션 쿠키 |
| GET | `/api/staff/roster` | 세션 | 전체 명단 |

`POST /api/rsvp`에 간단한 rate limit(같은 IP 분당 10건)을 건다. 장난 등록으로
식사 인원이 부풀려지면 실제 손해가 발생한다.

환경변수 (`.env.local` 및 Vercel 프로젝트 설정 양쪽에):

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STAFF_PIN=
NEXT_PUBLIC_RSVP_DEADLINE=2026-09-04
```

`.env.local`은 `.gitignore`에 반드시 포함. `.env.example`을 별도로 커밋한다.

---

## 6. 디자인 토큰

포스터와 동일한 시각 언어를 쓴다. 임의로 바꾸지 말 것.

```
--ink        #0d1626   배경
--ink-2      #141f33   입력 필드 배경
--line       #2c3a52   구분선
--paper      #f0ece4   본문 텍스트
--dim        #8491a4   보조 텍스트
--fine       #63707f   최소 텍스트
--red        #d01e36   강조 (버튼, 헤드라인 일부, 마감일)
```

서체 (Google Fonts):

- 디스플레이: **Big Shoulders Display** 700 — 헤드라인, 버튼, 통계 숫자
- 본문: **Work Sans** 400/600
- 유틸: **JetBrains Mono** 400 — 라벨, 메타 정보 (letter-spacing 0.18em)

레이아웃 규칙:

- 최대 폭 640px, 중앙 정렬
- **border-radius는 0.** 모든 요소가 각지다. 이 프로젝트의 시각적 성격이다.
- 버튼은 폭 100%, 대문자, letter-spacing 0.09em
- 입력 필드 포커스 시 테두리를 `--red`로

모바일 우선. 실제 사용의 95%가 휴대폰이다. 키보드 포커스 표시를 남기고
`prefers-reduced-motion`을 존중한다.

---

## 7. 헤더 블록 (모든 화면 공통)

```
KOREA DEFENSE VETERANS ASSOCIATION          USAG CASEY
────────────────────────────────────────────────────────
LIVE                    (크림색, 초대형)
K-POP                   (붉은색, 초대형)
AT THE WARRIOR CLUB
┌──────────────────────────────────────────────────────┐
│          WED 16 SEP  ·  1730 — 1930                  │  붉은 색면
└──────────────────────────────────────────────────────┘
VOICE ON THE STREET / FIRST SET 1820 / SECOND SET 1905
FREE FOOD / TWO LIVE SETS / RSVP BY FRI 4 SEP
```

---

## 8. 문안 (그대로 사용할 것)

영문 문안은 이미 여러 차례 다듬은 결과물이다. 임의로 고쳐 쓰지 말 것.

**등록 폼 안내**
> **Please reply by Friday 4 September.** This helps us get the food count right.
> It is not required to attend — you are welcome to walk in either way.

**등록 폼 하단**
> Your details are used only to plan this event and are not shared outside KDVA.
> Attendance is voluntary and off duty.

**확인 화면 제목**
> YOU'RE ON THE LIST

**확인 화면 안내**
> Just give your name at the door. Nothing to show, nothing to print.

**확인 화면 하단**
> Wednesday 16 September 2026, 1730–1930 · Warrior Club, Camp Casey.
> Official remarks run 15 minutes; the rest is food, music, and conversation.

**전 화면 푸터**
> Hosted by KDVA, a private veterans association — not an official U.S. Army
> function or endorsement. Attendance is voluntary and off duty. RSVP is not
> required to attend.
> Contact: Dr. John P. Maza, KDVA Casey Chapter

푸터의 면책 문구는 미 2사단 여단 법무실 지침(비연방기관에 대한 공식 후원의
외관 금지)에 대응하는 필수 문안이다. **삭제하거나 축약하지 말 것.**

오류 문안은 사과하지 않고, 무엇이 잘못됐고 어떻게 하면 되는지만 말한다.
예: "That did not save. Check your connection and try once more."

---

## 9. 작업 순서

한 단계씩 진행하고, 각 단계 끝에서 커밋한 뒤 확인을 받는다.

1. `create-next-app` 스캐폴딩, Tailwind 설정, 디자인 토큰과 폰트 적용,
   헤더 블록 컴포넌트까지. 이 시점에 헤더가 포스터처럼 보여야 한다.
2. `supabase/schema.sql` 작성, Supabase 클라이언트(서버 전용) 설정,
   `.env.example` 커밋
3. `/` 등록 폼 + `POST /api/rsvp` + `/thanks` — 등록이 끝까지 되는 상태
4. `/staff` PIN 로그인, 통계, 검색, 명단, CSV
5. 마감일 처리, rate limit, 접근성 점검
6. README와 배포 안내 작성

---

## 10. 완료 판정 체크리스트

이 항목이 전부 통과해야 끝난 것이다.

- [ ] 휴대폰에서 QR을 찍으면 등록 폼이 뜬다
- [ ] 등록하면 확인 화면으로 넘어간다
- [ ] `/staff`에서 PIN을 넣으면 명단에 그 이름이 보인다
- [ ] **페이지 소스와 JS 번들 어디에도 PIN과 service role 키가 없다**
      (배포 후 브라우저에서 직접 검색해 확인할 것)
- [ ] `EXPECTED` 숫자가 본인 + 동반 인원 합계와 일치한다
- [ ] CSV를 엑셀에서 열었을 때 한글이 깨지지 않는다
- [ ] 마감일 이후에도 등록이 막히지 않는다
- [ ] 360px 폭 화면에서 가로 스크롤이 생기지 않는다

---

## 11. 배포

GitHub 저장소 → Vercel Import → Framework Preset은 Next.js 자동 인식.
환경변수 4개를 Vercel 프로젝트 설정에 등록한다.

배포 주소가 확정되면 포스터의 QR을 그 주소로 다시 만들어야 한다.
포스터에는 텍스트 주소도 인쇄되어 있으므로 **두 곳 모두** 수정한다.
Vercel Settings → Domains에서 주소를 짧게 바꾸는 편이 좋다. 인쇄물에 들어가는
주소다.

---

## 12. 하지 말 것

- **참석자 개인 QR 발급, 현장 QR 스캔, 입장 체크인** — 이번 범위가 아니다.
  "있으면 좋을 것 같다"는 이유로 추가하지 말 것.
- 참석자에게 로그인·인증을 요구하는 것 — 등록률이 무너진다
- 이름·부대·이메일 외의 개인정보 수집
- 사진 촬영이나 사인회를 암시하는 문구 — 공연팀이 제한한 사항이다
- 푸터 면책 문구의 삭제 또는 축약
- 현장 참석(walk-in)을 막는 어떤 장치
