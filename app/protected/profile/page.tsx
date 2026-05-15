import { redirect } from 'next/navigation'

import { ProfileCard } from '@/components/profile/profile-card'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await getCurrentProfile()

  if (!profile) redirect('/auth/login')

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <h1 className="text-2xl font-bold">내 프로필</h1>
      <ProfileCard profile={profile} email={user.email} />
    </div>
  )
}
