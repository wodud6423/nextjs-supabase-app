import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * OAuth 콜백 라우트
 * 구글 등 소셜 로그인 후 Supabase가 리다이렉트하는 엔드포인트
 * code 파라미터를 세션으로 교환한다
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/protected'

  if (!code) {
    redirect(`/auth/error?error=No authorization code provided`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth 코드 교환 실패:', error.message)
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`)
  }

  // 인증 성공 후 목적지 페이지로 리다이렉트
  redirect(next)
}
