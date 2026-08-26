# CLAUDE.md — KDVA Casey Chapter RSVP

이 파일은 프로젝트 루트에 두고, 세션이 바뀌어도 유지되어야 하는 규칙만 담는다.
상세 명세는 `CLAUDE_CODE_PROMPT.md`를 참조한다.

## 프로젝트

2026년 9월 16일(수) 캠프 케이시 워리어 클럽에서 열리는 KDVA Casey Chapter
창설식의 참석 사전등록 웹앱.

**목적은 하나다. 행사 전에 몇 명이 오는지 파악해서 식사를 준비하는 것.**

행사 당일 입구에는 어떤 시스템도 두지 않는다. 이름을 대면 들어가고, 등록하지
않은 사람도 들어간다.

## 스택

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase · Vercel · pnpm

## 절대 규칙

1. **service role 키와 STAFF_PIN은 클라이언트 번들에 절대 들어가지 않는다.**
   모든 DB 접근은 `app/api/**/route.ts`에서만. `NEXT_PUBLIC_` 접두사를 이 두
   값에 붙이지 않는다.
2. **범위를 넓히지 않는다.** 개인 QR 발급, 현장 QR 스캔, 입장 체크인은 만들지
   않는다. 참석자 로그인도 없다.
3. **영문 문안을 임의로 고치지 않는다.** 명세 8절의 문장이 확정본이다.
   특히 푸터 면책 문구("not an official U.S. Army function or endorsement")는
   미 2사단 여단 법무실 지침에 대응하는 필수 문안이므로 삭제·축약 불가.

   승인된 예외 하나: 푸터의 Maza 박사 직함. 명세에는
   "Dr. John P. Maza, KDVA Casey Chapter"로 되어 있으나 그는 챕터
   **President**이며, 사용자 확인을 받아
   "Dr. John P. Maza, President, KDVA Casey Chapter"로 적는다. 되돌리지 말 것.

   또한 푸터에 `/staff` 링크를 넣지 않는다. 예전에 이름 뒤에 두었더니
   "Staff"가 그의 직함처럼 읽혔다. 스태프는 주소를 직접 입력해 들어간다.

6. **폼은 한 줄이 한 사람이다.** 동반 인원(guests) 항목은 없다. 명세 4.1 표에는
   있으나 사용자가 제거하라고 했다. 연랑해서 명세 4.3의 통계는 3개가 아니라
   `RSVPS` / `MEMBERSHIP` **2개**다. `EXPECTED`는 `RSVPS`와 항상 같아져서 버렸다.
   복원하지 말 것.

7. **이메일은 필수다.** 명세에는 선택이나 사용자가 필수로 바꿔다.
   이유: **이 행사의 목적은 참석자를 KDVA 회원으로 가입시키는 것**이다.
   이름만 있고 연락처가 없으면 행사 다음날 할 수 있는 일이 없다.

   단, 폼 하단은 여전히 "used only to plan this event"라고 적혀 있다.
   그러므로 **가입 안내 메일은 체크박스를 누른 사람에게만** 보낸다.
   전체 발송하려면 먼저 폼 문구를 바꿔야 한다.
4. **현장 참석을 막는 장치를 두지 않는다.** 등록 마감일(2026-09-04) 이후에도
   폼은 계속 열려 있다. 안내 문구만 바뀐다.
5. **외부 UI 라이브러리를 설치하지 않는다.** QR 라이브러리도 필요 없다.

## 화면

- `/` 등록 폼
- `/thanks` 확인 화면 (티켓·코드·QR 없음)
- `/staff` 명단 — PIN 세션, 읽기 전용, 통계 3개 + 검색 + CSV

## API

- `POST /api/rsvp` 등록 (rate limit: 같은 IP 분당 10건)
- `POST /api/staff/login` PIN 검증 → httpOnly 쿠키 12시간
- `GET /api/staff/roster` 명단

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
NEXT_PUBLIC_RSVP_DEADLINE=2026-09-04
```

`.env.local`은 커밋하지 않는다. `.env.example`은 커밋한다.

## 작업 방식

- 명세 9절의 단계 순서를 지킨다. 한 단계가 끝나면 멈추고 확인을 받는다.
- 각 단계 끝에 커밋한다.
- 사용자는 개발자가 아니다. 터미널 명령은 무엇을 왜 하는지 한 줄로 설명하고
  제시한다. Supabase·Vercel 화면 조작은 어느 메뉴에서 무엇을 누르는지 짚어준다.
- 애매하거나 충돌하는 요구가 있으면 추측하지 말고 먼저 묻는다.
