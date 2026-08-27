# KDVA Casey Chapter 창설식 RSVP

2026년 9월 16일(수) 캠프 케이시 워리어 클럽에서 열리는 KDVA Casey Chapter
창설식의 참석 사전 등록 웹사이트.

**목적은 하나다. 몇 명이 오는지 파악해서 음식을 준비하는 것.** 그리고 이 행사를
통해 만난 사람들에게 KDVA 가입을 안내하는 것.

행사 당일 입구에는 어떤 시스템도 두지 않는다. 이름을 대면 들어가고, 등록하지
않은 사람도 들어간다.

---

## 주소

| 용도 | 주소 |
|---|---|
| 등록 폼 (포스터 QR이 가리키는 곳) | https://kdva-casey-chapter-launch.vercel.app |
| 명단 (스태프 전용, PIN 필요) | https://kdva-casey-chapter-launch.vercel.app/staff |

> ### ⚠️ 주소는 이제 바꿀 수 없다
>
> **이 주소로 QR을 만들어 이미 배포했다.** 포스터와 테이블 텐트가 이미 나가
> 있으므로, 주소를 바꾸면 그 인쇄물의 QR이 전부 죽는다.
>
> 더 짧은 주소가 눈에 보이더라도 **바꾸지 말 것.** Vercel 프로젝트
> 이름을 바꾸는 것도 주소에 영향을 줄 수 있다.
>
> Vercel **Settings → Domains** 목록에 이 주소가 들어 있어야 한다.
> 목록에 없는 주소는 특정 배포에 묶인 임시 별칭이라, 언젠가 죽거나
> 옆 배포의 예전 화면을 보여준다.

---

## 참석자에게 보이는 화면

1. **`/`** — 등록 폼. 이름, 소속, 부대(선택), 이메일, KDVA 가입 안내 희망 여부.
2. **`/thanks`** — 확인 화면. 티켓도 코드도 QR도 없다. 이름만 대면 되기 때문이다.

**등록 마감일(2026-09-04)이 지나도 폼은 계속 열려 있다.** 안내 문구만
"Registration has closed, but you are still welcome to walk in."으로 바뀐다.
마감은 음식 수량을 잡기 위한 편의이지 참석 조건이 아니다.

---

## 명단 보기 (`/staff`)

주소 끝에 `/staff`를 붙이고 PIN을 입력한다. **행사 전에 스태프 휴대폰에
북마크해 둘 것.** 당일 시끄러운 입구에서 긴 주소를 타이핑하게 하면 안 된다.

- **`RSVPS`** — 응답한 사람 수. 케이터링에 넘길 숫자다.
- **`MEMBERSHIP`** — 가입 안내를 요청한 사람 수.
- **`FIND SOMEONE`** — 이름이나 부대로 검색.
- 명단에서 가입 요청자는 이름 옆에 빨간 **`KDVA`** 표시가 붙는다.
- **`EXPORT CSV`** — 엑셀로 바로 열린다. 한글이 깨지지 않도록 UTF-8 표식(BOM)을
  넣어두었다. 열: Name, Affiliation, Unit, Email, Membership interest, RSVP time

로그인은 12시간 유지된다. 시도는 분당 5회로 제한된다(4자리 PIN 무작정 대입 방지).

읽기 전용 화면이다. 수정·삭제 기능은 없다. 잘못 들어간 줄은 Supabase
Table Editor에서 직접 지운다.

### 가입 안내 메일을 보낼 때

폼 하단에 이렇게 적혀 있다.

> Your details are used only to plan this event and are not shared outside KDVA.

**"이 행사를 준비하는 데만 쓴다"는 약속이다.** 그러므로 가입 안내 메일은
체크박스를 누른 사람 — 명단에서 `KDVA` 표시가 붙은 사람 — 에게만 보낸다.
전원에게 보내려면 폼 문구를 먼저 바꿔야 한다.

---

## 환경변수

4개다. `.env.local`(로컬)과 Vercel 프로젝트 설정 양쪽에 넣는다.

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STAFF_PIN=1234
NEXT_PUBLIC_RSVP_DEADLINE=2026-09-04
```

- `SUPABASE_SERVICE_ROLE_KEY`는 Supabase → Project Settings → API →
  Project API keys → **`service_role`** (anon 아님).
- `STAFF_PIN`은 **행사 날짜와 무관한 숫자로.** 포스터에 `16 SEP`이 인쇄돼
  있어서 `0916`은 제일 먼저 찍힐 숫자다. **정한 숫자를 따로 적어둘 것** —
  Vercel에 비밀로 저장하면 다시 볼 수 없다.
- `NEXT_PUBLIC_RSVP_DEADLINE`은 브라우저로 내려가는 값이라 Vercel에서
  비밀로 저장할 수 없다. 정상이다.
- **Vercel에서 환경변수를 바꾸면 반드시 Redeploy 해야 적용된다.**

`.env.local`은 `.gitignore`에 들어 있어 GitHub에 올라가지 않는다.

---

## Supabase

`supabase/schema.sql`을 SQL Editor에 붙여넣고 Run 한 번이면 끝난다.

표 이름은 `public.casey_rsvps`다. `rsvps`가 아닌 이유는 이 Supabase 프로젝트를
다른 앱과 함께 쓰기 때문이다. 흔한 이름을 쓰면 이미 있는 표와 부딪히고,
`create table if not exists`가 조용히 아무 일도 안 한 채 성공했다고 표시한다.

**RLS 정책을 일부러 두지 않았다.** 모든 읽기·쓰기는 service role 키를 쓰는
서버 라우트를 통한다. 브라우저는 Supabase 키를 쥐지 않는다.

무료 프로젝트는 7일간 요청이 없으면 일시정지되고, 그동안 등록이 실패한다.
9월 16일까지 조용한 기간이 생길 것 같으면 대비가 필요하다.

---

## 이 프로젝트의 제1 원칙

**service role 키와 STAFF_PIN은 브라우저로 절대 나가지 않는다.**

이전 단일 파일 버전은 PIN이 페이지 소스에 그대로 박혀 있었다. 이 재작성의
핵심 목적이 그 문제의 해결이다.

기계적으로 보장돼 있다. `lib/supabase.ts`는 `server-only`를 import 하므로,
클라이언트 컴포넌트가 이 파일을 조금이라도 참조하면 **키가 새는 대신 빌드가
실패한다.**

배포 후 직접 확인하는 법:

```bash
U=https://kdva-casey-chapter-launch.vercel.app
curl -s $U/staff | grep -oE '/_next/static/[^"]+\.js' | sort -u | \
  while read c; do curl -s "$U$c"; done | \
  grep -c -E "service_role|STAFF_PIN|eyJhbGciOiJIUzI1NiI|supabase\.co"
```

**`0`이 나와야 한다.**

---

## 로컬에서 돌리기

```bash
corepack pnpm install
corepack pnpm dev
```

`http://localhost:3000` 접속.

> 이 PC에는 `pnpm`이 따로 설치돼 있지 않아 `corepack`을 앞에 붙인다.
> 끌 때는 Ctrl+C.
>
> **`pnpm dev`가 도는 중에 `pnpm build`를 돌리지 말 것.** 둘이 같은 `.next`
> 폴더를 쓰기 때문에 개발 서버가 자기 파일을 잃고 500을 뱉는다.

---

## 배포

GitHub `main` 브랜치에 push하면 Vercel이 자동 배포한다.

Vercel 프로젝트를 처음 연결할 때 **Framework Preset이 `Next.js`인지 확인할 것.**
Vercel은 저장소를 가져온 그 순간의 내용으로 프레임워크를 판단하고 고정한다.
`Other`로 잡히면 빌드는 성공(Ready)했는데 페이지는 404가 난다.

**Deployment Protection은 꺼져 있어야 한다.** 켜져 있으면 포스터 QR을 찍은
장병이 등록 폼 대신 Vercel 로그인 화면을 본다.

---

## 문제가 생겼을 때

### 명단에 "Could not load the roster."가 뜬다

화면은 이유를 말해주지 않는다. 브라우저에 DB 오류를 그대로 보여주면 안 되기
때문이다. 진짜 원인은 Vercel에 적혀 있다.

**Vercel → 프로젝트 → Logs** (또는 배포 상세의 **Runtime Logs**) 를 열고
`roster read failed`로 시작하는 줄을 찾는다. 그 옆에 진짜 이유가 있다.

가장 흔한 원인은 **코드와 데이터베이스가 어긋난 것**이다. Supabase에서 열을
바꿨는데 그 변경을 아는 코드가 아직 배포되지 않았거나, 그 반대인 경우다.
실제로 한 번 겪었다: `guests` 열을 지웠는데 접속한 주소가 아직 옛 코드를
서빙하고 있어서 `column casey_rsvps.guests does not exist`가 났다.

**순서를 지키면 안 생긴다. 코드를 먼저 배포하고, 그다음 SQL을 실행한다.**

### 화면이 옛날 것처럼 보인다

Vercel은 배포마다 여러 주소를 만들고, 옛 주소가 옛 배포에 묶인 채 남아 있을
수 있다. **배포 상세 화면의 Domains 목록에 있는 주소**를 쓴다. 목록에 없는
주소는 죽은 별칭이다.

구별하는 법: 명단 화면의 통계가 **두 칸**(`RSVPS` / `MEMBERSHIP`)이면 최신이다.
세 칸이면 옛 배포다.

### PIN이 안 먹는다

Vercel 환경변수 `STAFF_PIN`의 값이다. 로컬 `.env.local`의 값이 아니다.
비밀로 저장했으면 다시 볼 수 없으니 덮어쓰고 **Redeploy** 한다.
시도는 분당 5회로 제한된다. 막히면 1분 기다린다.

### 등록이 저장되지 않는다

Supabase 무료 프로젝트가 일시정지됐을 수 있다(7일간 요청이 없으면 정지).
Supabase 대시보드에서 프로젝트 상태가 `Healthy`인지 확인한다.

---

## 행사 당일 순서

1. **9월 4일 이후** — `/staff`에서 `EXPORT CSV`, 엑셀로 열어 케이터링에 인원 전달
2. **행사 전날** — 스태프 휴대폰에 `/staff` 주소 북마크, PIN 공유
3. **당일 입구** — 명단은 참고용이다. 이름이 없어도 들여보낸다
4. **행사 후** — `EXPORT CSV`, `Membership interest`가 `yes`인 사람에게 가입 안내

---

## 손대지 말아야 할 것

- **푸터 면책 문구** — 미 2사단 법무실 지침에 대응하는 필수 문안이다.
  삭제·축약 불가.
- **현장 참석(walk-in)을 막는 장치** — 등록은 편의이지 조건이 아니다.
- **참석자에게 로그인·인증을 요구하는 것** — 등록률이 무너진다.
- **개인 QR 발급, 현장 QR 스캔, 입장 체크인** — 이번 범위가 아니다.

자세한 규칙은 `CLAUDE.md`, 전체 명세는 `CLAUDE_CODE_PROMPT.md`.

---

## 기술

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase · Vercel · pnpm

외부 UI 라이브러리 없음. 의존성은 `next`, `react`, `react-dom`,
`@supabase/supabase-js`, `server-only` 다섯 개뿐이다.

```
app/
  page.tsx                    등록 폼
  thanks/page.tsx             확인 화면
  staff/page.tsx              명단 (서버에서 PIN 세션 확인)
  api/rsvp/route.ts           등록 저장
  api/staff/login/route.ts    PIN 검증 → httpOnly 쿠키 12시간
  api/staff/roster/route.ts   명단 조회 (쿠키 필요)
components/                   화면 조각
lib/supabase.ts               Supabase 키를 읽는 유일한 파일 (server-only)
lib/session.ts                스태프 세션 서명·검증
supabase/schema.sql           표 생성 SQL
```
