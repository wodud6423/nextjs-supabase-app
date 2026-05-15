---
name: project_google_oauth
description: 구글 소셜 로그인 구현 현황 — 신규 파일과 수정 파일 목록, 외부 설정 사항
metadata:
  type: project
---

## 구현 완료 (2026-05-15)

**신규 파일:**

- `app/auth/callback/route.ts` — OAuth code exchange 콜백 핸들러 (`exchangeCodeForSession` 사용)
- `components/google-login-button.tsx` — 재사용 가능한 Google 로그인 버튼 (Google SVG 아이콘 인라인 포함)

**수정 파일:**

- `components/login-form.tsx` — 구분선 + GoogleLoginButton 추가
- `components/sign-up-form.tsx` — 구분선 + GoogleLoginButton 추가

**Why:** 이메일/비밀번호 외 소셜 로그인 수단 추가 요청

**How to apply:** 추후 GitHub, Kakao 등 다른 소셜 로그인 추가 시 `google-login-button.tsx` 패턴 참고하여 동일하게 구현. 콜백 라우트는 `/auth/callback/route.ts` 하나로 모든 OAuth provider 공통 처리.

## 외부 설정 (사용자 직접 필요)

1. **Google Cloud Console**
   - OAuth 2.0 클라이언트 ID 생성 (Web application 타입)
   - 승인된 리다이렉션 URI: `https://<supabase-project-ref>.supabase.co/auth/v1/callback`

2. **Supabase 대시보드**
   - Authentication > Providers > Google 활성화
   - Google Client ID / Client Secret 입력
   - Authentication > URL Configuration > Site URL: `http://localhost:3000`
   - Redirect URLs에 `http://localhost:3000/auth/callback` 추가
