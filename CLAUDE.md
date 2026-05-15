# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

노션을 데이터베이스로 활용한 견적서 관리 시스템. 클라이언트가 고유 URL로 견적서를 조회하고 PDF로 다운로드할 수 있으며, 관리자는 대시보드에서 견적서를 관리한다.

현재 단계: **프로필 기능 구현 완료** → 다음 목표: 노션 API 연동 및 견적서 기능 구현 (PRD 참고)

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npx tsc --noEmit # 타입 체크
npx shadcn@latest add [component]  # shadcn/ui 컴포넌트 추가
```

## 환경 변수

`.env.local` 파일에 설정 (`.env.example` 참고):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## 아키텍처

### 인증 흐름

- `app/auth/` — 로그인, 회원가입, 비밀번호 재설정 페이지
- `app/auth/confirm/route.ts` — Supabase 이메일 인증 콜백 처리
- `app/protected/` — 인증된 사용자만 접근 가능한 영역 (`layout.tsx`에서 세션 검증)
- Supabase SSR 클라이언트는 매 요청마다 새로 생성해야 함 (전역 변수 금지)

### Supabase 클라이언트

- `lib/supabase/server.ts` — Server Component/Route Handler용 (`createServerClient<Database>`)
- `lib/supabase/client.ts` — Client Component용 (`createBrowserClient<Database>`)
- `lib/supabase/proxy.ts` — 세션 갱신 프록시
- `lib/supabase/types.ts` — 자동 생성된 DB 타입 + 편의 alias (`Profile`, `ProfileInsert`, `ProfileUpdate`)
- `lib/supabase/profiles.ts` — 프로필 CRUD 함수 (서버 전용)

### DB 스키마

현재 구현된 테이블:

- `public.profiles` — auth.users와 1:1 연결, RLS 활성화, 신규 유저 생성 시 트리거로 자동 생성

스키마 변경은 Supabase MCP(`mcp__supabase__apply_migration`) 또는 Supabase 대시보드에서 수행.  
변경 후 `mcp__supabase__generate_typescript_types`로 `lib/supabase/types.ts` 재생성.

### 컴포넌트 구조

- `components/ui/` — shadcn/ui 기반 순수 UI (비즈니스 로직 없음)
- `components/profile/` — 프로필 관련 컴포넌트 (`profile-card.tsx`, `profile-edit-form.tsx`)
- `components/auth-button.tsx` 등 — 공통 기능 컴포넌트

### 라우팅 패턴

```
app/
├── page.tsx                    # 랜딩 (공개)
├── auth/                       # 인증 관련 (공개)
├── protected/                  # 인증 필요
│   ├── layout.tsx              # 네비게이션 + 세션 보호
│   ├── page.tsx                # 대시보드
│   └── profile/                # 프로필 조회/편집
└── (미구현) invoice/[id]/     # 견적서 조회 (공개, PRD F002)
```

## 코딩 컨벤션

- `any` 타입 사용 금지
- 파일명: kebab-case, 컴포넌트명: PascalCase
- import는 항상 `@/` 경로 별칭 사용 (상대 경로 금지)
- 폼: React Hook Form + Zod 스키마 검증
- 스타일: Tailwind CSS, 반응형 필수
- Server Component 기본, 상태/이벤트 필요 시에만 `"use client"`

## 개발 워크플로우

- 새 작업은 `docs/ROADMAP.md`에서 현황 확인 후 진행
- API/비즈니스 로직 구현 후 Playwright MCP로 브라우저 테스트 수행
- DB 스키마 변경 시 마이그레이션 명 형식: `동사_대상` (예: `create_profiles_table`)
