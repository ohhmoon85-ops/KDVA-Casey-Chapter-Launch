# KDVA Casey Chapter Year-End Meet & Greet — 등록·체크인·회원가입

2026년 12월 3일(목) 18:00–20:00 캠프 케이시 워리어 클럽에서 열리는 KDVA Casey
Chapter Year-End Meet & Greet(Live K-POP, BlueBeatz 출연)의 등록·체크인 웹사이트.
9월 16일 창설식 때 만든 사이트를 같은 주소로 다시 쓴다.

**목적은 셋이다. 음식 수량 파악, 현장 체크인, 그리고 그 자리에서 KDVA 회원가입.**

입구의 종이 등록지를 이 사이트가 대신한다(포스터 QR + 입구 태블릿). 그래도
등록하지 않은 사람의 입장은 막지 않는다.

---

## 주소

| 용도 | 주소 |
|---|---|
| 등록 폼 (포스터 QR이 가리키는 곳) | https://kdva-casey-chapter-launch.vercel.app |
| 명단 (스태프 전용, PIN 필요) | https://kdva-casey-chapter-launch.vercel.app/staff |
| 입구 태블릿 | https://kdva-casey-chapter-launch.vercel.app/?kiosk=1 |

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

1. **`/`** — 등록 폼. 성, 이름, 소속(I am), 부대(선택), 이메일, 그리고
   **CHECK IN + JOIN KDVA / CHECK IN ONLY** 중 하나(미리 선택돼 있지 않다).
   가입을 고르면 복무상태·계급을 묻고 회원가입 앱의 `members` 표에 바로 저장한다.
   같은 휴대폰으로 다시 들어오면 "Checked in as …"와 가입 버튼이 보인다.
2. **`/thanks`** — 확인 화면. 티켓도 코드도 QR도 없다. 가입 결과를 보여주고,
   체크인만 한 사람에게는 한 번 더 가입을 권한다.
3. **`/?kiosk=1`** — 입구 태블릿. 앞사람 정보를 남기지도 보여주지도 않고,
   등록 6초 뒤 자동으로 첫 화면으로 돌아온다.
4. **`/?same=1`** — 확인 화면의 "REGISTER A COLLEAGUE (SAME UNIT)". 소속·부대를
   미리 채운다. 동료를 가입시키려면 "They told me they want to join KDVA."를
   체크해야 한다.

**등록 마감일(2026-11-27)이 지나도 폼은 계속 열려 있다.** 안내 문구만
"The food count is in, but you can still sign up here…"로 바뀐다. 행사 당일에는
`CHECK IN` 화면이 된다. 마감은 음식 수량을 잡기 위한 편의이지 참석 조건이 아니다.

---

## 명단 보기 (`/staff`)

주소 끝에 `/staff`를 붙이고 PIN을 입력한다. **행사 전에 스태프 휴대폰에
북마크해 둘 것.** 당일 시끄러운 입구에서 긴 주소를 타이핑하게 하면 안 된다.

- **`RSVPS`** — 응답한 사람 수. 케이터링에 넘길 숫자다.
- **`KDVA MEMBERS`** — 이 중 실제 `members` 표에 있는 사람 수. 아래 작은 글씨는
  가입을 원했지만 아직 회원이 아닌 사람 수.
- 화면은 30초마다 저절로 새로고침된다.
- 이름 옆 표시: **`KDVA ✓`** 회원, **`WANTS KDVA`** 원했지만 아직 미가입.
- **`MAKE MEMBER`** — 현장에서 "가입할게요"라고 한 사람, 또는 예전 체크박스로
  희망만 표시한 사람을 스태프가 복무상태·계급을 물어 바로 가입시킨다.
- **`NOT MEMBERS YET`** — 아직 회원이 아닌 사람만 보기.
- **`OPEN DOOR TABLET`** — 입구 태블릿 화면을 새 탭으로 연다.
- **`FIND SOMEONE`** — 이름이나 부대로 검색.
- **`EXPORT CSV`** — 엑셀로 바로 열린다. 한글이 깨지지 않도록 UTF-8 표식(BOM)을
  넣어두었다. Name 열은 "Kim, Minsu"처럼 성, 이름 순이다.
  열: Name, Affiliation, Unit, Email, Membership interest, KDVA member, RSVP time

로그인은 12시간 유지된다. 시도는 분당 5회로 제한된다(4자리 PIN 무작정 대입 방지).

회원 전환 외에는 수정·삭제 기능이 없다. 잘못 들어간 줄은 Supabase
Table Editor에서 직접 지운다.

### 이메일을 어디까지 써도 되나

폼 하단에 이렇게 적혀 있다.

> Your details are used to plan this event and, if you choose to join, to register
> you as a KDVA member. They are not shared outside KDVA.

그러므로 **CHECK IN ONLY를 고른 사람의 이메일은 이 행사 준비에만 쓴다.**
회원 안내는 회원(`KDVA ✓`)에게만 보낸다. 다른 용도로 쓰려면 폼 문구를 먼저 바꿔야 한다.

---

## 환경변수

4개다. `.env.local`(로컬)과 Vercel 프로젝트 설정 양쪽에 넣는다.

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STAFF_PIN=1234
NEXT_PUBLIC_RSVP_DEADLINE=2026-11-27
```

- `SUPABASE_SERVICE_ROLE_KEY`는 Supabase → Project Settings → API →
  Project API keys → **`service_role`** (anon 아님).
- `STAFF_PIN`은 **행사 날짜와 무관한 숫자로.** 포스터에 `3 DEC`이 인쇄돼
  있어서 `1203`은 제일 먼저 찍힐 숫자다. **정한 숫자를 따로 적어둘 것** —
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
그래서 **매일 한 번 자동으로 DB를 깨우는 장치**를 붙여두었다(아래).

---

## Supabase 일시정지 방지 (keep-alive)

행사 전 조용한 기간이 길어도 프로젝트가 잠들지 않게, 하루 한 번 가벼운 읽기를
보낸다. 쓰기는 하지 않는다.

| 무엇 | 어디 |
|---|---|
| 읽기 엔드포인트 | `GET /api/keepalive` — `casey_rsvps`에서 `id` 한 줄만 읽고 `{"ok":true}` 반환 |
| 부르는 쪽 | `vercel.json`의 **Vercel Cron** — 매일 10:13(KST), 경로 `/api/keepalive` |

- 손으로 확인하는 법: 브라우저에
  `https://kdva-casey-chapter-launch.vercel.app/api/keepalive`를 열어서
  `{"ok":true,...}`가 보이면 사이트도 DB도 살아 있다는 뜻이다. 그 외가 나오면
  Vercel → Logs에서 `keep-alive`로 시작하는 줄을 본다.
- **Secret·환경변수는 새로 필요 없다.** 엔드포인트가 공개 GET이고 아무 정보도
  내보내지 않기 때문이다.
- Vercel 무료(Hobby) 플랜은 **하루 1회까지만** 허용한다(그보다 잦은 표현은 배포가
  실패한다). 실행 시각은 지정한 시간대 안에서 ±1시간 흩어지고, 실패해도 자동
  재시도는 없다. 하루 걸러도 7일 기준이라 문제되지 않는다.
- 스케줄은 **push해야 적용된다.** `vercel.json`을 바꾸면 재배포가 되어야 cron이 갱신된다.
- **Vercel Cron은 이미 정지된 프로젝트를 스스로 되살리지 못한다.** 정지를 막는
  장치다. 정지되면 Supabase 대시보드에서 **Restore project**를 눌러야 한다.

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
Supabase 대시보드에서 프로젝트 상태가 `Healthy`인지 확인한다. 정지되어 있으면
대시보드에서 **Restore project**를 누른다 — 자동 keep-alive는 정지를 막을 뿐
이미 정지된 프로젝트를 스스로 되살리지는 못한다.

평소에 잠들었는지는 브라우저에 `/api/keepalive`를 열어 보면 안다
(`{"ok":true}`가 아니면 사이트 라 DB가 죽은 것이다).

---

## 행사 당일 순서

1. **11월 27일 이후** — `/staff`에서 `EXPORT CSV`, 엑셀로 열어 케이터링에 인원 전달
2. **행사 전날** — 스태프 휴대폰에 `/staff` 주소 북마크, PIN 공유.
   입구 태블릿에서 `/?kiosk=1`을 열어 홈 화면에 추가해 둔다
3. **당일 입구** — 태블릿 또는 포스터 QR로 등록. 명단은 참고용이다. 이름이 없어도
   들여보낸다. "가입할게요" 하는 사람은 `/staff`의 `MAKE MEMBER`로 처리
4. **행사 후** — `/staff`에서 `NOT MEMBERS YET`으로 `WANTS KDVA` 남은 사람 확인

---

## 손대지 말아야 할 것

- **푸터 면책 문구** — 미 2사단 법무실 지침에 대응하는 필수 문안이다.
  삭제·축약 불가.
- **현장 참석(walk-in)을 막는 장치** — 등록은 편의이지 조건이 아니다.
- **참석자에게 로그인·인증을 요구하는 것** — 등록률이 무너진다.
- **개인 QR 발급, 현장 QR 스캔** — 범위가 아니다. 체크인은 폼에 한 줄 적기까지만.
- **`members` 표의 값 형식** — 회원가입 앱과 한 글자도 다르면 안 된다(HQ 주간 보고).
  시험 데이터는 `test+...@example.com`으로 만들고 반드시 지운다.

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
  api/keepalive/route.ts      DB 깨우기 (하루 1회, 읽기만)
  api/staff/login/route.ts    PIN 검증 → httpOnly 쿠키 12시간
  api/staff/roster/route.ts   명단 조회 (쿠키 필요)
components/                   화면 조각
lib/supabase.ts               Supabase 키를 읽는 유일한 파일 (server-only)
lib/session.ts                스태프 세션 서명·검증
supabase/schema.sql           표 생성 SQL
vercel.json                   매일 /api/keepalive를 부르는 cron
```
