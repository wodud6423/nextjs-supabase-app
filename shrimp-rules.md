# Development Guidelines

## Project Overview

- **프로젝트명**: GatherEase MVP
- **스택**: Next.js 15 (App Router) + TypeScript 5 + React 19 + Supabase + TailwindCSS v4 + shadcn/ui
- **핵심 설계**: 로그인 없이 localStorage 토큰(`host_token`, `participant_token`)으로 주최자/참여자 권한 식별
- **폼**: React Hook Form + Zod 필수
- **배포**: Vercel

---

## Project Architecture

```
app/
├── auth/               # 공개 인증 페이지 (login, sign-up, confirm, callback)
├── protected/          # Supabase Auth 필요 영역 (layout.tsx에서 getClaims() 검증)
│   └── profile/        # 프로필 조회/편집
├── event/              # GatherEase 기능 (인증 불필요, localStorage 토큰으로 권한 구분)
│   ├── new/            # 모임 생성
│   └── [id]/           # 모임 홈, 참여, 공지, 정산
└── page.tsx            # 랜딩 (공개)

components/
├── ui/                 # shadcn/ui 순수 UI — 비즈니스 로직 금지
├── profile/            # 프로필 전용 컴포넌트
└── event/              # (추가 예정) 모임 기능 컴포넌트

lib/
├── supabase/
│   ├── server.ts       # Server Component/Route Handler 전용 클라이언트
│   ├── client.ts       # Client Component 전용 클라이언트
│   ├── proxy.ts        # 미들웨어: 세션 갱신 + 미인증 리다이렉트
│   ├── types.ts        # Supabase CLI 자동 생성 타입 (수동 편집 금지)
│   └── profiles.ts     # 프로필 CRUD (서버 전용)
└── utils.ts            # cn(), hasEnvVars()

docs/
├── PRD.md              # 기능 명세 (F001~F014)
├── ROADMAP.md          # Phase별 개발 진행 현황
└── LEANCANVAS.md       # 비즈니스 모델
```

---

## Code Standards

### 네이밍

- 파일명: `kebab-case` (예: `event-home.tsx`)
- 컴포넌트명: `PascalCase` (예: `EventHome`)
- 폴더명: 소문자 (예: `components/event/`)
- import: 항상 `@/` 경로 별칭 사용, 상대 경로(`./`, `../`) 금지

### 타입

- `any` 타입 사용 금지
- DB 관련 타입은 `lib/supabase/types.ts`의 자동 생성 타입 또는 alias 사용
- 새 DB 테이블 추가 시 반드시 `mcp__supabase__generate_typescript_types`로 `lib/supabase/types.ts` 재생성 후 alias 추가

### 컴포넌트

- 기본: Server Component
- `useState`, `useEffect`, 이벤트 핸들러, 브라우저 API(`localStorage` 등) 필요 시에만 `"use client"` 선언
- `components/ui/`에 비즈니스 로직 추가 금지

---

## Functionality Implementation Standards

### Supabase 클라이언트 사용 규칙

- Server Component / Route Handler → `lib/supabase/server.ts`의 `createClient()` 사용
- Client Component → `lib/supabase/client.ts`의 `createClient()` 사용
- **전역 변수로 클라이언트 저장 금지** — 매 요청마다 새로 생성해야 함
- 세션 확인: `supabase.auth.getClaims()` 사용 (`getUser()` 사용 금지)

```typescript
// ✅ 올바른 Server Component 세션 확인
const supabase = await createClient()
const { data } = await supabase.auth.getClaims()
const user = data?.claims

// ❌ 금지
const supabase = globalThis.supabaseClient // 전역 변수 금지
await supabase.auth.getUser() // getClaims() 사용할 것
```

### localStorage 토큰 규칙

- 주최자 토큰 키: `gg_host_{event_id}` (모임 생성 시 UUID v4 생성)
- 참여자 토큰 키: `gg_participant_{event_id}` (참여 등록 시 UUID v4 생성)
- 토큰 값은 클라이언트에서 `crypto.randomUUID()` 생성 후 DB에 함께 저장
- localStorage 접근은 반드시 `"use client"` 컴포넌트 또는 훅에서만 수행
- 토큰 훅은 `lib/hooks/useEventToken.ts`에 구현 (재사용)

```typescript
// ✅ 토큰 키 형식
const HOST_TOKEN_KEY = `gg_host_${eventId}`
const PARTICIPANT_TOKEN_KEY = `gg_participant_${eventId}`
```

### 폼 구현 규칙

- React Hook Form + Zod 조합 필수
- Zod 스키마는 `lib/schemas/` 디렉토리에 분리 저장
- `zodResolver` 사용, 직접 `validate` 함수 작성 금지

```typescript
// ✅ 올바른 폼 패턴
const schema = z.object({ title: z.string().min(1) })
const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) })
```

### DB 스키마 변경 워크플로우

1. `mcp__supabase__apply_migration` 으로 마이그레이션 적용
2. 마이그레이션 명 형식: `동사_대상` (예: `create_events_table`, `add_status_to_participants`)
3. `mcp__supabase__generate_typescript_types` 실행 → `lib/supabase/types.ts` 덮어쓰기
4. `lib/supabase/types.ts` 하단에 새 테이블 alias 추가

```typescript
// lib/supabase/types.ts 하단에 추가
export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
```

### 새 기능 페이지 추가 시

- `app/event/[id]/` 하위에 추가
- 인증 불필요 — `protected/`에 추가하지 말 것
- 해당 기능 컴포넌트는 `components/event/` 하위에 생성

---

## Key File Interaction Standards

### DB 테이블 추가/변경 시 동시 수정 파일

| 작업           | 수정 파일                                                                 |
| -------------- | ------------------------------------------------------------------------- |
| 새 테이블 추가 | `lib/supabase/types.ts` (재생성), `docs/ROADMAP.md` (Phase 진행 업데이트) |
| 새 CRUD 함수   | `lib/supabase/[기능명].ts` 신규 생성 (서버 전용)                          |
| 새 페이지 추가 | `app/event/[id]/[기능]/page.tsx`, `components/event/[기능]/`              |

### ROADMAP.md 업데이트 시점

- Phase 내 태스크 완료 시 `docs/ROADMAP.md`의 상태 아이콘 업데이트 (⏳→✅)
- 새 태스크 발견 시 해당 Phase에 추가

### 스타일 변경 시

- Tailwind 클래스 직접 사용, 별도 CSS 파일 생성 금지 (`app/globals.css` 예외)
- 다크모드: `dark:` prefix 항상 함께 추가
- 반응형: `sm:` → `md:` → `lg:` 순서로 작성

---

## Framework / Library Usage Standards

### shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add [component-name]
# 추가된 컴포넌트는 components/ui/에 자동 생성됨 — 직접 편집 가능
```

### Supabase Realtime 구독

- Client Component에서만 사용
- `useEffect` cleanup에서 반드시 `supabase.removeChannel()` 호출

---

## AI Decision-making Standards

### Server vs Client Component 판단 트리

```
상태(useState) 필요? → YES → "use client"
이벤트 핸들러 필요? → YES → "use client"
localStorage 접근? → YES → "use client"
위 모두 NO → Server Component (기본값)
```

### 새 기능 구현 위치 판단

```
Supabase Auth 세션 필요?
├── YES → app/protected/ 하위
└── NO → app/event/ 하위 (localStorage 토큰으로 권한 구분)
```

### DB 쿼리 위치 판단

```
컴포넌트 타입?
├── Server Component → lib/supabase/server.ts 클라이언트 직접 사용 또는 lib/supabase/*.ts 함수 호출
└── Client Component → lib/supabase/client.ts 클라이언트 사용 (단, 민감 로직은 Route Handler로 분리)
```

---

## Prohibited Actions

- `lib/supabase/types.ts` 수동 편집 금지 — Supabase CLI로만 재생성
- `components/ui/` 파일에 props 외 비즈니스 로직 추가 금지
- 상대 경로 import (`./`, `../`) 사용 금지
- `any` 타입 사용 금지
- Supabase 클라이언트를 전역 변수로 저장 금지
- `supabase.auth.getUser()` 사용 금지 → `getClaims()` 사용
- `app/event/` 하위 페이지에 `app/protected/layout.tsx` 세션 보호 적용 금지
- localStorage 접근을 Server Component에서 수행 금지
- `app/globals.css` 이외 별도 CSS 파일 생성 금지
- PRD에 없는 기능(MVP 이후 제외 항목) 구현 금지: 회원가입/로그인, 푸시 알림, 이미지 첨부, 맞춤 정산, 반복 모임 설정
