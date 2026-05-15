import { redirect } from 'next/navigation'

import { ProfileEditForm } from '@/components/profile/profile-edit-form'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { createClient } from '@/lib/supabase/server'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await getCurrentProfile()

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <h1 className="text-2xl font-bold">프로필 편집</h1>
      <ProfileEditForm initialData={profile} />
    </div>
  )
}
