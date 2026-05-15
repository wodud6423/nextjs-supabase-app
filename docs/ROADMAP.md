# ROADMAP — GatherEase MVP

> 마지막 업데이트: 2026-05-15 | PRD 기반 버전: v1.0

## 진행 현황

| Phase   | 제목                  | 상태   | 완료율 |
| ------- | --------------------- | ------ | ------ |
| Phase 0 | 프로젝트 초기 설정    | 완료   | 100%   |
| Phase 1 | DB 스키마 및 인프라   | 미시작 | 0%     |
| Phase 2 | 공통 모듈 및 레이아웃 | 미시작 | 0%     |
| Phase 3 | 핵심 기능 구현        | 미시작 | 0%     |
| Phase 4 | 추가 기능 구현        | 미시작 | 0%     |
| Phase 5 | 최적화 및 배포        | 미시작 | 0%     |

---

## Phase 0: 프로젝트 초기 설정 — 완료

### 왜 이 순서인가?

Supabase 연동, Next.js 15 App Router, TypeScript, TailwindCSS v4, shadcn/ui, React Hook Form, Zod 등 기반 설정이 먼저 확정되어야 이후 모든 Phase의 코드가 안정적으로 작성된다. 기반 설정 없이 기능을 구현하면 환경 변수·스타일 토큰·타입 설정 변경 시 전체 코드를 수정해야 하는 상황이 생긴다.

### 작업 내용

- [x] **[Phase 0] 기본 프로젝트 환경 구성**
  - [x] `package.json` — Next.js 15, React 19, TypeScript, TailwindCSS v4 의존성 설치 완료
  - [x] `.env.local` / `.env.example` — Supabase 환경 변수 설정 완료
  - [x] `components.json` — shadcn/ui 설정 완료
  - [x] `tsconfig.json` — `@/*` 경로 별칭, strict mode 활성화 완료
  - [x] `.eslintrc` / `prettier.config.js` — ESLint, Prettier 설정 완료

- [x] **[Phase 0] Supabase 클라이언트 및 인증 기반 구축**
  - [x] `lib/supabase/client.ts` — 브라우저 클라이언트 (`createBrowserClient<Database>`)
  - [x] `lib/supabase/server.ts` — 서버 클라이언트 (`createServerClient<Database>`)
  - [x] `lib/supabase/proxy.ts` — 세션 갱신 프록시
  - [x] `lib/supabase/types.ts` — DB 자동 생성 타입 (profiles 테이블 포함)
  - [x] `app/auth/` — 로그인·회원가입·비밀번호 재설정 페이지 (기존 기능 유지)
  - [x] `app/protected/` — 인증 필요 영역 레이아웃·대시보드·프로필 (기존 기능 유지)

### 예상 소요 시간

완료됨

### 완료 기준

- [x] `npm run dev` 정상 실행
- [x] Supabase 연결 성공
- [x] TypeScript 컴파일 에러 없음
- [x] ESLint 경고 없음

---

## Phase 1: DB 스키마 및 인프라 — 1~2일

### 왜 이 순서인가?

GatherEase는 localStorage 토큰 기반 권한 식별 구조이므로 DB 스키마와 Row Level Security(RLS) 정책이 먼저 확정되어야 한다. 스키마가 정해지기 전에 UI나 API를 작성하면 컬럼 변경 때마다 타입·쿼리·폼 스키마를 전부 수정해야 한다. 또한 Supabase 타입 자동 생성은 마이그레이션 이후에만 가능하므로 이 Phase가 모든 후속 Phase의 선행 조건이다.

### 작업 내용

- [ ] **[Phase 1] GatherEase DB 마이그레이션 생성**
  - [ ] `supabase/migrations/create_events_table.sql` — events 테이블 생성 (id, title, description, event_date, location, max_participants, host_token, invite_code, created_at)
  - [ ] `supabase/migrations/create_participants_table.sql` — participants 테이블 생성 (id, event_id, nickname, status, participant_token, created_at)
  - [ ] `supabase/migrations/create_notices_table.sql` — notices 테이블 생성 (id, event_id, content, created_at)
  - [ ] `supabase/migrations/create_comments_table.sql` — comments 테이블 생성 (id, notice_id, participant_token, nickname, content, created_at)
  - [ ] `supabase/migrations/create_expense_items_table.sql` — expense_items 테이블 생성 (id, event_id, label, amount, created_at)
  - [ ] `supabase/migrations/create_payment_status_table.sql` — payment_status 테이블 생성 (id, event_id, participant_id, is_paid)

- [ ] **[Phase 1] RLS 정책 및 Supabase 타입 갱신**
  - [ ] `supabase/migrations/rls_policies.sql` — 각 테이블 RLS 활성화 및 공개 읽기 정책 설정 (GatherEase는 인증 없음 → anon key로 전 테이블 접근 허용, 민감 토큰 필드 보호)
  - [ ] `lib/supabase/types.ts` — `mcp__supabase__generate_typescript_types` 실행 후 재생성 (events, participants, notices, comments, expense_items, payment_status 타입 포함)
  - [ ] `lib/supabase/types.ts` — 편의 alias 추가 (Event, Participant, Notice, Comment, ExpenseItem, PaymentStatus)

### 예상 소요 시간

1~2일

### 완료 기준

- [ ] Supabase 대시보드에서 6개 테이블 모두 확인 가능
- [ ] `lib/supabase/types.ts`에 모든 테이블 타입 포함
- [ ] anon key로 events 테이블 SELECT 성공
- [ ] TypeScript 컴파일 에러 없음

---

## Phase 2: 공통 모듈 및 레이아웃 — 2~3일

### 왜 이 순서인가?

localStorage 토큰 훅, Supabase 쿼리 유틸, Zod 검증 스키마, 공통 레이아웃은 Phase 3의 모든 페이지에서 반복 사용된다. 이 모듈을 먼저 완성하면 기능 구현 단계에서 중복 코드 없이 재사용할 수 있고, 특정 기능에 종속되지 않아 다른 프로젝트에서도 활용 가능한 수준이 된다.

### 작업 내용

- [ ] **[Phase 2] GatherEase 타입 정의 및 상수**
  - [ ] `types/gatherease.ts` — Event, Participant, Notice, Comment, ExpenseItem, PaymentStatus 도메인 타입 및 ParticipantStatus enum (`attending | undecided | absent | waiting`)
  - [ ] `lib/constants.ts` — 토큰 키 상수 (`GG_HOST_TOKEN_KEY`, `GG_PARTICIPANT_TOKEN_KEY`), 참여 상태 레이블 상수

- [ ] **[Phase 2] localStorage 토큰 훅 구현 (F013)**
  - [ ] `hooks/use-event-token.ts` — `useEventToken(eventId)` 훅: localStorage에서 `gg_host_{eventId}`, `gg_participant_{eventId}` 읽기/쓰기, 주최자 여부(`isHost`) 반환
  - [ ] `hooks/use-participant-token.ts` — `useParticipantToken(eventId)` 훅: participant_token 관리, 참여 여부(`isParticipant`) 반환

- [ ] **[Phase 2] Supabase 쿼리 유틸 함수**
  - [ ] `lib/gatherease/events.ts` — `getEvent(id)`, `createEvent(data)` 서버/클라이언트 공용 함수
  - [ ] `lib/gatherease/participants.ts` — `getParticipants(eventId)`, `createParticipant(data)`, `deleteParticipant(id)` 함수
  - [ ] `lib/gatherease/notices.ts` — `getNotices(eventId)`, `createNotice(data)` 함수
  - [ ] `lib/gatherease/comments.ts` — `getComments(noticeId)`, `createComment(data)`, `deleteComment(id)` 함수
  - [ ] `lib/gatherease/settlement.ts` — `getExpenseItems(eventId)`, `createExpenseItem(data)`, `getPaymentStatus(eventId)`, `updatePaymentStatus(id, isPaid)` 함수

- [ ] **[Phase 2] Zod 검증 스키마**
  - [ ] `lib/validations/event.ts` — 모임 생성 폼 스키마 (title 필수, event_date 필수, location 필수, max_participants 숫자 양수 필수)
  - [ ] `lib/validations/participant.ts` — 참여 등록 폼 스키마 (nickname 필수, status 라디오 필수)
  - [ ] `lib/validations/settlement.ts` — 비용 항목 폼 스키마 (label 필수, amount 양수 필수)

- [ ] **[Phase 2] 공통 레이아웃 및 공유 UI 컴포넌트**
  - [ ] `app/(gatherease)/layout.tsx` — GatherEase 전용 레이아웃 (헤더: 로고 + "모임 만들기" 링크, 모바일 반응형)
  - [ ] `components/gatherease/event-header.tsx` — 모임 기본 정보 표시 컴포넌트 (제목, 날짜, 장소, 인원)
  - [ ] `components/gatherease/participant-status-badge.tsx` — 참여 상태 뱃지 컴포넌트 (attending/undecided/absent/waiting 색상 분기)
  - [ ] `components/gatherease/token-guard.tsx` — localStorage 토큰 여부에 따른 조건부 렌더링 래퍼 컴포넌트
  - [ ] `components/gatherease/copy-button.tsx` — URL/초대 코드 복사 버튼 컴포넌트 (클립보드 API + 토스트)

### 예상 소요 시간

2~3일

### 완료 기준

- [ ] `useEventToken` 훅이 localStorage를 올바르게 읽고 씀
- [ ] Zod 스키마가 유효성 검증 에러를 정확히 반환
- [ ] 공통 컴포넌트가 특정 페이지에 종속되지 않고 독립적으로 렌더링
- [ ] TypeScript 컴파일 에러 없음

---

## Phase 3: 핵심 기능 구현 — 5~7일

### 왜 이 순서인가?

GatherEase의 핵심 가치는 "모임 생성 → 초대 링크 공유 → 참여 등록 → 공지/정산 관리"로 이어지는 전체 사용자 여정이다. Phase 1(DB)과 Phase 2(공통 모듈)가 완성된 이후에야 각 페이지가 실제 데이터로 동작할 수 있다. 페이지 구현 순서는 사용자 여정 흐름(랜딩 → 생성 → 홈 → 참여 → 공지 → 정산)을 따른다.

### 작업 내용

#### 랜딩 페이지 (F014)

- [ ] **[Phase 3] 랜딩 페이지 구현**
  - [ ] `app/page.tsx` — 기존 랜딩 페이지를 GatherEase 랜딩으로 교체 (서비스 가치 제안, "모임 만들기" CTA 버튼)
  - [ ] `components/gatherease/landing-hero.tsx` — 히어로 섹션 (3분 모임 생성, 앱 설치 불필요 메시지)
  - [ ] `components/gatherease/landing-features.tsx` — 핵심 기능 3가지 소개 카드 (참여 관리, 공지, 정산)

#### 모임 생성 페이지 (F001, F013)

- [ ] **[Phase 3] 모임 생성 폼 구현**
  - [ ] `app/event/new/page.tsx` — 모임 생성 페이지 (Server Component 래퍼)
  - [ ] `components/gatherease/event-create-form.tsx` — React Hook Form + Zod 폼: 모임명, 날짜/시간, 장소, 최대 인원, 설명 입력
  - [ ] `app/event/new/actions.ts` — `createEvent` Server Action: UUID v4 host_token 생성, 6자리 invite_code 생성, events 테이블 INSERT, localStorage 저장 후 `/event/[id]` 리다이렉트

#### 모임 홈 페이지 (F002, F004, F005, F006, F013)

- [ ] **[Phase 3] 모임 홈 페이지 구현**
  - [ ] `app/event/[id]/page.tsx` — 모임 홈 페이지 (Server Component, event 데이터 fetch)
  - [ ] `components/gatherease/event-home-host.tsx` — 주최자 뷰: 초대 URL 복사, 6자리 초대 코드 표시, 참여자 삭제 버튼 (F002, F004)
  - [ ] `components/gatherease/event-home-guest.tsx` — 비참여자 뷰: "참여하기" 버튼 표시 (F003 진입)
  - [ ] `components/gatherease/participant-tabs.tsx` — 참여/미정/불참/대기자 탭 + 각 탭별 참여자 목록 (F004, F005)
  - [ ] `components/gatherease/latest-notice-banner.tsx` — 모임 홈 상단 최신 공지 1개 배너 표시 (F006)

#### 참여 등록 페이지 (F003, F005, F013)

- [ ] **[Phase 3] 참여 등록 폼 구현**
  - [ ] `app/event/[id]/join/page.tsx` — 참여 등록 페이지 (이미 참여한 경우 모임 홈으로 리다이렉트)
  - [ ] `components/gatherease/join-form.tsx` — React Hook Form + Zod 폼: 닉네임 입력, 참여 상태 라디오 선택, 최대 인원 초과 시 대기자 안내 문구 표시 (F005)
  - [ ] `app/event/[id]/join/actions.ts` — `joinEvent` Server Action: 닉네임 중복 확인, 최대 인원 초과 시 status를 'waiting'으로 자동 전환 (F005), UUID v4 participant_token 생성, participants 테이블 INSERT, localStorage 저장

#### 공지·댓글 페이지 (F006, F007, F008)

- [ ] **[Phase 3] 공지 및 댓글 기능 구현**
  - [ ] `app/event/[id]/notices/page.tsx` — 공지 목록 페이지 (Server Component, notices + comments fetch)
  - [ ] `components/gatherease/notice-list.tsx` — 전체 공지 시간 역순 목록, 각 공지 하단 댓글 표시 (F007)
  - [ ] `components/gatherease/notice-create-form.tsx` — 주최자 전용 공지 작성 폼 (host_token 검증, F006)
  - [ ] `components/gatherease/comment-section.tsx` — 댓글 입력 폼 + 댓글 목록 (참여자 전용 작성, F008)
  - [ ] `app/event/[id]/notices/actions.ts` — `createNotice`, `createComment`, `deleteComment` Server Actions (localStorage 토큰 검증, F008)

#### 정산 페이지 (F009, F010, F011, F012)

- [ ] **[Phase 3] 정산 관리 기능 구현**
  - [ ] `app/event/[id]/settlement/page.tsx` — 정산 관리 페이지 (Server Component, expense_items + payment_status fetch)
  - [ ] `components/gatherease/expense-item-list.tsx` — 비용 항목 목록 + 총 비용 표시 (F009)
  - [ ] `components/gatherease/expense-item-form.tsx` — 주최자 전용 항목명·금액 입력 폼 (F009)
  - [ ] `components/gatherease/settlement-summary.tsx` — 총 비용 / 참여자 수 자동 계산 표시 (1/N, F010)
  - [ ] `components/gatherease/payment-status-list.tsx` — 참여자별 납부 완료 체크박스 (주최자만 조작, F011)
  - [ ] `app/event/[id]/settlement/actions.ts` — `addExpenseItem`, `togglePaymentStatus` Server Actions

### 예상 소요 시간

5~7일

### 완료 기준

- [ ] 모임 생성 후 고유 URL과 6자리 초대 코드가 발급됨
- [ ] 공유 URL 클릭 후 닉네임 입력만으로 참여 등록 완료
- [ ] 최대 인원 초과 시 자동 대기자 전환 동작
- [ ] 주최자만 공지 작성 가능, 참여자는 댓글만 작성 가능
- [ ] 1/N 정산 금액 자동 계산 표시
- [ ] 모든 페이지 모바일 반응형 확인
- [ ] Playwright MCP로 전체 사용자 여정(생성 → 참여 → 공지 → 정산) E2E 테스트 통과

---

## Phase 4: 추가 기능 구현 — 2~3일

### 왜 이 순서인가?

정산 결과 공유 링크(F012)와 실시간 구독은 핵심 기능(Phase 3)이 완성된 이후에야 검증이 가능하다. 실시간 구독은 참여자 목록·댓글 기능이 이미 동작하는 상태에서 추가해야 의도한 UX를 제공할 수 있으며, 미완성 화면에 실시간을 붙이면 디버깅이 두 배로 복잡해진다.

### 작업 내용

#### 정산 결과 공유 (F012)

- [ ] **[Phase 4] 정산 결과 공유 링크 구현**
  - [ ] `app/event/[id]/settlement/result/page.tsx` — 읽기 전용 정산 결과 공유 페이지 (F012)
  - [ ] `components/gatherease/settlement-result.tsx` — 정산 결과 요약 (총 비용, 인당 금액, 납부 현황 테이블)
  - [ ] `components/gatherease/share-result-button.tsx` — "정산 결과 공유" 버튼: `/event/[id]/settlement/result` URL 복사 + 토스트 표시

#### Supabase 실시간 구독

- [ ] **[Phase 4] 실시간 구독 적용**
  - [ ] `hooks/use-realtime-participants.ts` — Supabase Realtime으로 participants 테이블 변경 구독 (모임 홈 참여자 목록 자동 갱신)
  - [ ] `hooks/use-realtime-comments.ts` — comments 테이블 변경 구독 (공지 페이지 댓글 자동 갱신)
  - [ ] `hooks/use-realtime-payment.ts` — payment_status 테이블 변경 구독 (정산 페이지 납부 현황 자동 갱신)

#### 참여 상태 변경

- [ ] **[Phase 4] 기존 참여자 상태 변경 기능**
  - [ ] `components/gatherease/change-status-button.tsx` — 이미 참여한 사용자의 참여 상태 변경 버튼 (participant_token 검증, 대기자 자동 전환 재계산 포함)
  - [ ] `app/event/[id]/actions.ts` — `updateParticipantStatus` Server Action

### 예상 소요 시간

2~3일

### 완료 기준

- [ ] 정산 결과 공유 URL에서 인증 없이 정산 내역 조회 가능
- [ ] 참여자 등록 시 다른 사용자 화면에 실시간 반영
- [ ] 댓글 작성 시 페이지 새로고침 없이 즉시 표시
- [ ] 참여 상태 변경 후 탭 카운트 즉시 갱신

---

## Phase 5: 최적화 및 배포 — 1~2일

### 왜 이 순서인가?

기능이 완성된 이후 실제 사용 패턴을 보고 최적화해야 의미가 있다. 미완성 기능에 캐싱·이미지 최적화를 적용하면 기능 변경 시 캐시 무효화 로직까지 함께 수정해야 하는 이중 작업이 발생한다. Vercel 배포는 전체 기능이 통합된 상태에서 수행해야 환경 변수 누락 등 배포 이슈를 조기에 발견할 수 있다.

### 작업 내용

- [ ] **[Phase 5] 성능 최적화**
  - [ ] `app/event/[id]/page.tsx` — React Suspense 경계 설정, 스켈레톤 로딩 UI 추가
  - [ ] `lib/gatherease/events.ts` — Next.js `unstable_cache` / `revalidatePath` 캐싱 전략 적용
  - [ ] `app/event/[id]/loading.tsx` — 모임 홈 로딩 스켈레톤
  - [ ] `app/event/[id]/notices/loading.tsx` — 공지 목록 로딩 스켈레톤
  - [ ] `app/event/[id]/settlement/loading.tsx` — 정산 페이지 로딩 스켈레톤

- [ ] **[Phase 5] 에러 처리 및 Not Found 페이지**
  - [ ] `app/event/[id]/not-found.tsx` — 존재하지 않는 모임 접근 시 커스텀 404 페이지
  - [ ] `app/event/[id]/error.tsx` — 서버 에러 발생 시 에러 경계 페이지
  - [ ] `app/event/new/error.tsx` — 모임 생성 실패 시 에러 경계

- [ ] **[Phase 5] Vercel 배포 설정**
  - [ ] `vercel.json` — 배포 설정 (Node.js 버전, 리전)
  - [ ] Vercel 환경 변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
  - [ ] Supabase 프로덕션 프로젝트 URL 허용 목록 (Supabase Dashboard → Authentication → URL Configuration)

### 예상 소요 시간

1~2일

### 완료 기준

- [ ] Lighthouse 성능 점수 90점 이상 (모바일 기준)
- [ ] 존재하지 않는 모임 접근 시 커스텀 404 페이지 표시
- [ ] Vercel 프리뷰 배포 URL에서 전체 사용자 여정 정상 동작
- [ ] 모임 생성 → 초대 링크 공유까지 3분 이내 완료 (MVP 성공 기준)

---

## 의존성 맵

```
Phase 0 (환경 설정)
  └── Phase 1 (DB 스키마)
        └── Phase 2 (공통 모듈)
              └── Phase 3 (핵심 기능)
                    ├── F001 (모임 생성) → F002 (초대 공유) → F003 (참여 등록)
                    ├── F003 (참여 등록) → F004 (참여자 목록)
                    ├── F004 + F001 max_participants → F005 (대기자 관리)
                    ├── F001 → F006 (공지 작성) → F007 (공지 목록)
                    ├── F003 + F007 → F008 (댓글)
                    ├── F004 → F009 (비용 입력) → F010 (1/N 계산)
                    ├── F004 + F009 → F011 (납부 체크)
                    └── F011 → F012 (결과 공유)  ← Phase 4
                          └── Phase 5 (최적화/배포)
```

---

## 리스크 레지스터

| 리스크                                           | 영향도 | 가능성 | 완화 전략                                                                 |
| ------------------------------------------------ | ------ | ------ | ------------------------------------------------------------------------- |
| localStorage 토큰 분실 (다른 기기·브라우저 접근) | 높음   | 높음   | MVP 범위 내 허용, 안내 문구("이 링크를 저장하세요") 표시                  |
| 초대 코드 6자리 충돌 가능성                      | 중간   | 낮음   | invite_code + event_id 복합 조회로 중복 방지, 생성 시 중복 확인 로직 추가 |
| Supabase anon key로 host_token 노출              | 높음   | 중간   | host_token SELECT는 RLS로 차단, 주최자 인증은 서버 액션에서만 수행        |
| 최대 인원 동시 등록 경쟁 조건                    | 중간   | 중간   | Supabase 트랜잭션 또는 DB 함수(count 기반 조건부 INSERT)로 처리           |
| Supabase Realtime 구독 연결 실패                 | 낮음   | 낮음   | fallback으로 수동 새로고침 버튼 제공                                      |
| 닉네임 중복 검증 타이밍 이슈                     | 낮음   | 중간   | DB UNIQUE 제약 + 클라이언트 실시간 중복 확인 API 호출                     |

---

## 기술 표준 및 컨벤션

### 코딩 스타일

- 들여쓰기: 2칸 (스페이스)
- 파일명: kebab-case (`event-create-form.tsx`)
- 컴포넌트명: PascalCase (`EventCreateForm`)
- import: 항상 `@/` 경로 별칭 사용 (상대 경로 금지)
- `any` 타입 사용 금지 — 모든 타입 명시적 정의
- Server Component 기본, 상태/이벤트 필요 시에만 `"use client"` 추가
- 폼: React Hook Form + Zod 스키마 검증 필수
- 스타일: Tailwind CSS v4 유틸리티 클래스, 반응형 필수

### 커밋 메시지 규칙

```
<타입>: <내용>

feat: 모임 생성 폼 구현
fix: 최대 인원 초과 시 대기자 전환 버그 수정
chore: expense_items 테이블 마이그레이션 추가
refactor: useEventToken 훅 분리
```

### GatherEase 전용 컨벤션

- Server Action 파일명: `app/.../actions.ts`
- 훅 파일명: `hooks/use-<기능>.ts`
- Supabase 쿼리 함수: `lib/gatherease/<도메인>.ts`
- Zod 스키마: `lib/validations/<도메인>.ts`
- localStorage 키: `gg_host_{eventId}`, `gg_participant_{eventId}` (constants.ts 상수 사용)

---

## 미결 사항 (Open Questions)

| #   | 질문                                                                                                                                                               | 영향 범위                                         | 결정 기한       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | --------------- |
| Q1  | host_token을 DB에 저장할 때 평문 저장 vs 해시 저장? 평문이면 DB 유출 시 주최자 권한 탈취 가능                                                                      | Phase 1 RLS 설계, Phase 3 Server Action 인증 로직 | Phase 1 시작 전 |
| Q2  | participants 테이블의 닉네임 중복 제약을 event_id 단위로 적용할 것인가 (동명이인 참여 불가)?                                                                       | Phase 1 마이그레이션, Phase 3 참여 등록 에러 처리 | Phase 1 시작 전 |
| Q3  | Supabase RLS 정책에서 anon key로 모든 테이블을 허용하면 임의 데이터 삽입이 가능함. 최소한의 rate limiting 또는 event_id 존재 검증을 서버 액션에서 수행해야 하는가? | Phase 3 Server Action 보안                        | Phase 3 시작 전 |
| Q4  | 정산 결과 공유 URL(`/event/[id]/settlement/result`)은 별도 토큰 없이 공개 접근 허용인가, 아니면 추가 read_token이 필요한가?                                        | Phase 4 F012 구현                                 | Phase 4 시작 전 |
| Q5  | 모임 삭제 기능은 MVP에 포함되는가? (PRD 미명시)                                                                                                                    | Phase 3 모임 홈 주최자 뷰                         | Phase 3 시작 전 |

---

## 성공 지표 (KPIs)

### MVP 성공 기준 (PRD 기준)

- 주최자 1명이 모임 생성 → 초대 링크 공유까지 **3분 이내** 완료
- 참여자가 **앱 설치 없이** 링크 클릭만으로 전 기능 사용 가능
- 첫 사용자 **10팀 온보딩** 후 재사용률 측정

### 기술적 지표

- Lighthouse 성능 점수 90점 이상 (모바일)
- 모임 생성 API 응답 시간 < 2초
- 페이지 첫 로드 시간 (LCP) < 2.5초
- TypeScript 컴파일 에러 0건

---

## 핵심 설계 원칙

1. **토큰 기반 권한 분리**: host_token은 Server Action에서만 검증하고, 클라이언트에는 권한 UI만 노출한다. DB에서 직접 필터링하지 않는다.
2. **Server Component 우선**: 데이터 패칭은 Server Component에서 수행하고, 상태가 필요한 폼·토스트·실시간 구독만 Client Component로 분리한다.
3. **Server Action으로 단일 진입점**: 쓰기 작업(INSERT/UPDATE/DELETE)은 모두 Server Action을 통해 처리하여 클라이언트에서 Supabase를 직접 호출하지 않는다.
4. **점진적 개선**: MVP에서는 페이지 새로고침 기반으로 먼저 구현하고, Phase 4에서 Realtime을 추가한다.
5. **모바일 퍼스트**: 초대 링크를 카카오톡으로 공유하고 모바일에서 클릭하는 시나리오가 주 사용 패턴이므로 모든 UI는 모바일(375px)을 기준으로 먼저 설계한다.

---

## 최종 목표

이 로드맵이 완성되면 **수영·헬스·등산 동호회 운영자나 친구 모임 주최자가 카카오톡 단톡방 없이**, 단 하나의 링크로 참여 관리·공지·정산을 처리할 수 있는 GatherEase MVP가 Vercel에 배포된 상태가 된다. 참여자는 앱 설치 없이 링크 클릭만으로 전 기능을 사용할 수 있으며, 주최자는 모임 생성부터 초대 링크 공유까지 3분 이내에 완료할 수 있다.
