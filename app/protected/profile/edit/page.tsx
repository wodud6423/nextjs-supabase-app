import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <h1 className="text-2xl font-bold">프로필 편집</h1>
      <ProfileEditForm initialData={profile} />
    </div>
  );
}
