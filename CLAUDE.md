# CLAUDE.md — KDVA Casey Chapter RSVP

이 파일은 프로젝트 루트에 두고, 세션이 바뀌어도 유지되어야 하는 규칙만 담는다.
상세 명세는 `CLAUDE_CODE_PROMPT.md`를 참조한다. 단, 아래 규칙과 명세가 다르면
이 파일이 우선한다(사용자 승인을 받아 바뀐 부분이 있다).

## 프로젝트

2026년 12월 3일(목) 18:00–20:00 캠프 케이시 워리어 클럽에서 열리는 KDVA Casey
Chapter **Year-End Meet & Greet**(Live K-POP, BlueBeatz 출연)의 등록·체크인 웹앱.

원래 9월 16일(수) 창설식용으로 만들었고, 같은 주소로 연말 행사에 다시 쓴다.
행사 문구(헤더·안내·확인 화면·.ics)는 12월 포스터가 기준이다. 9월 등록자는
DB에 `event = 'casey-2026-09-16'`으로 남아 있고, 명단은 `lib/event.ts`의
`EVENT`(`casey-2026-12-03`)만 보여준다.

**목적은 셋이다. 식사 인원 파악, 현장 체크인, 그리고 참석자의 KDVA 회원가입.**

**이 앱이 입구의 종이 등록지를 대체한다.** 참석자는 포스터 QR로, 또는 입구
태블릿(`/?kiosk=1`)으로 등록한다. 11/24 험프리스 행사에서 쓴 종이 등록지는 자필
판독이 어렵고 "″(위와 같음)" 표시로 이메일이 빠져 대리 가입이 어려웠다.
그래도 **등록하지 않은 사람의 입장을 막지 않는다**(규칙 4).

## 스택

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase · Vercel · pnpm

## 절대 규칙

1. **service role 키와 STAFF_PIN은 클라이언트 번들에 절대 들어가지 않는다.**
   모든 DB 접근은 `app/api/**/route.ts`와 `server-only` 모듈(`lib/supabase.ts`,
   `lib/members.ts`)에서만. `NEXT_PUBLIC_` 접두사를 이 두 값에 붙이지 않는다.
2. **범위를 넓히지 않는다.** 체크인은 "폼에 한 줄 적기"까지만이다. 개인 QR 발급,
   현장 QR 스캔, 참석자 로그인은 만들지 않는다.
3. **영문 문안을 임의로 고치지 않는다.** 명세 8절의 문장과, 아래에 적은 승인
   문안이 확정본이다. 고칠 필요가 있으면 먼저 묻는다.
   특히 푸터 면책 문구("not an official U.S. Army function or endorsement")는
   미 2사단 여단 법무실 지침에 대응하는 필수 문안이므로 삭제·축약 불가.

   승인된 예외: 푸터의 Maza 박사 직함. 명세에는
   "Dr. John P. Maza, KDVA Casey Chapter"로 되어 있으나 그는 챕터
   **President**이며, 사용자 확인을 받아
   "Dr. John P. Maza, President, KDVA Casey Chapter"로 적는다. 되돌리지 말 것.

   승인된 예외 둘: 헤더 셋째 줄. 마감(11/27)까지는 포스터대로
   `FREE FOOD / RSVP BY FRI 27 NOV`, 마감 다음 날부터는
   `FREE FOOD / WALK IN, EAT, LISTEN, STAY`(포스터 하단 문구). 당일 체크인하는
   사람에게 지난 마감일을 보이지 않기 위해서다.

   또한 푸터에 `/staff` 링크를 넣지 않는다. 예전에 이름 뒤에 두었더니
   "Staff"가 그의 직함처럼 읽혔다. 스태프는 주소를 직접 입력해 들어간다.

   **가입 유도 승인 문안 (확정본):** `lib/membership.ts`의 `pitchFor()` 문장
   ("I am"별 한 줄), 혜택 3줄, "Join the KDVA Casey Chapter · Free · 30 seconds",
   "Email only — no birth date, no phone, no dues.", 확인 화면의
   "One more thing — KDVA membership is free." 패널과
   "Welcome to the KDVA Casey Chapter. We'll be in touch by email.",
   동료 동의 문구 "They told me they want to join KDVA.", 가입자 수 문구
   ("N people have joined KDVA for this event" / "N people joined KDVA tonight").
   거절을 비난하는 문구, 미리 선택, 숨긴 동의는 쓰지 않는다.

10. **이름은 성(LAST NAME)과 이름(FIRST NAME)을 따로 받는다.** 둘 다 필수.
   DB에는 기존 `name` 열에 "Last, First"로 합쳐 저장한다(스키마 변경 없음).

6. **폼은 한 줄이 한 사람이다.** 동반 인원(guests) 항목은 없다. 명세 4.1 표에는
   있으나 사용자가 제거하라고 했다. 그래서 스태프 통계는 3개가 아니라
   `RSVPS` / `KDVA MEMBERS` **2개**다. `EXPECTED`는 `RSVPS`와 항상 같아져서 버렸다.
   복원하지 말 것. `KDVA MEMBERS`는 이메일이 실제 `members` 표에 있는 사람 수다.

7. **이메일은 필수이고, 회원가입은 둘 중 하나를 반드시 고른다.**
   "CHECK IN + JOIN KDVA" / "CHECK IN ONLY". **어느 쪽도 미리 선택해 두지 않는다.**
   가입을 고르면 복무상태·계급을 받아 `members` 표에 바로 저장한다.

   폼 하단 개인정보 문구는 이렇다.
   > Your details are used to plan this event and, if you choose to join, to
   > register you as a KDVA member. They are not shared outside KDVA.

   그러므로 **CHECK IN ONLY를 고른 사람의 이메일은 이 행사 준비에만 쓴다.**
   가입 안내 메일 등 그 밖의 용도로 쓰려면 먼저 이 문구를 바꿔야 한다.

   `/?same=1`(동료 연속 등록)에서 JOIN을 고르면 동의 확인란을 체크해야 제출된다.
   본인이 직접 입력하는 일반 등록과 입구 태블릿에서는 확인란이 없다.
4. **현장 참석을 막는 장치를 두지 않는다.** 등록 마감일(2026-11-27) 이후에도
   폼은 계속 열려 있다. 안내 문구만 바뀐다.
5. **외부 UI 라이브러리를 설치하지 않는다.** QR 라이브러리도 필요 없다.

8. **배포 주소를 바꾸지 않는다.**
   `https://kdva-casey-chapter-launch.vercel.app`

   이 주소로 QR을 만들어 **이미 배포했다.** 포스터와 테이블 텐트가
   나가 있으므로 주소를 바꾸면 그 인쇄물이 전부 쓸모없어진다.
   더 짧게 바꾸자는 제안을 하지 말 것. Vercel 프로젝트 이름 변경도
   주소에 영향을 줄 수 있으므로 마찬가지다.

9. **스키마를 바꿀 땐 코드를 먼저 배포하고 SQL을 나중에 실행한다.**
   반대로 하면 옛 코드가 없는 열을 요구해 명단이 통째로 안 뜬다.
   실제로 `guests` 열을 지우면서 한 번 겪었다.

11. **`members` 표는 회원가입 앱(katusa-membership)의 것이다.** 같은 Supabase
   프로젝트에 있고, HQ 주간 보고 엑셀이 여기서 나온다.
   - 복무상태·계급 `value` 문자열과 `composeRank()` 조합 규칙은 **회원가입 앱의
     `lib/membership.ts`와 한 글자도 다르지 않게 유지한다.** 화면용 영문 라벨만
     이 앱 것이다.
   - 저장 형식: `name` "Last First"(50자), `email` 소문자, `station` = unit
     (군 미복무 민간인은 null), `rank` = `composeRank()`.
   - `country`·`state` 열은 건드리지 않는다. `members` 스키마를 바꾸지 않는다.
     katusa-membership 저장소는 수정하지 않는다.
   - 시험할 땐 `test+...@example.com`만 쓰고 **끝나면 반드시 지운다.** 남기면
     HQ 주간 보고에 들어간다.

## 화면

- `/` 등록 폼. 행사 당일(`isEventDay()`, 서울 시간)엔 `CHECK IN` 문구로 바뀐다.
  같은 휴대폰으로 다시 오면 "Checked in as …" 배너와 가입 버튼(localStorage
  `kdva_casey_checkins`, 실패해도 폼은 동작).
- `/?kiosk=1` 입구 태블릿. 기기에 아무것도 남기지 않고, 앞사람을 보여주지 않으며,
  확인 화면에서 6초 뒤 폼으로 돌아온다(가입 패널을 만지는 동안은 멈춘다).
- `/?same=1` 같은 부대 동료 연속 등록. 직전 기록의 I AM·UNIT을 채운다.
- `/thanks?r=<id>` 확인 화면 (티켓·코드·QR 없음). 가입 결과, 체크인만 한
  사람에게는 두 번째 가입 권유.
- `/staff` 명단 — PIN 세션, 통계 2개 + 검색 + 필터 + CSV, 30초마다 새로고침,
  행별 `MAKE MEMBER`, `OPEN DOOR TABLET`.

## API

- `POST /api/rsvp` 등록 + (선택 시) 회원 저장. rate limit 같은 IP 분당 10건.
  응답의 `token`은 그 한 줄만 나중에 가입시킬 수 있는 서명이다.
- `POST /api/join` 체크인만 했던 사람이 나중에 가입. 토큰 필수, 분당 10건.
- `POST /api/staff/join` 스태프가 한 줄을 회원으로 전환. 스태프 세션 필수.
- `GET /api/stats` **공개.** 이 행사로 가입한 인원 수 하나만 돌려준다
  (`{ joinedTonight }`, 30초 캐시). 이름·이메일 등 다른 정보를 절대 넣지 않는다.
  폼은 5명 미만이면 숫자를 숨긴다.
- `GET /api/keepalive` DB 깨우기 — `id` 한 줄 읽기만, 쓰기 없음. `vercel.json`의 Cron이 하루 1회 호출
- `POST /api/staff/login` PIN 검증 → httpOnly 쿠키 12시간
- `GET /api/staff/roster` 명단 + 행별 `is_member`

## 디자인 토큰

```
--ink #0d1626  --ink-2 #141f33  --line #2c3a52
--paper #f0ece4  --dim #8491a4  --fine #63707f  --red #d01e36
```

Big Shoulders Display 700 (디스플레이) · Work Sans 400/600 (본문) ·
JetBrains Mono 400 (라벨, letter-spacing 0.18em)

최대 폭 640px 중앙 정렬 · **border-radius 0** · 모바일 우선 ·
버튼은 폭 100% 대문자 letter-spacing 0.09em

## 환경변수

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STAFF_PIN
NEXT_PUBLIC_RSVP_DEADLINE=2026-11-27
```

`.env.local`은 커밋하지 않는다. `.env.example`은 커밋한다.

## 작업 방식

- 명세 9절의 단계 순서를 지킨다. 한 단계가 끝나면 멈추고 확인을 받는다.
- 각 단계 끝에 커밋한다.
- 사용자는 개발자가 아니다. 터미널 명령은 무엇을 왜 하는지 한 줄로 설명하고
  제시한다. Supabase·Vercel 화면 조작은 어느 메뉴에서 무엇을 누르는지 짚어준다.
- 애매하거나 충돌하는 요구가 있으면 추측하지 말고 먼저 묻는다.
