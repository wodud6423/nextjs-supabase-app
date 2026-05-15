import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { ProfileCard } from "@/components/profile/profile-card";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();

  if (!profile) redirect("/auth/login");

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <h1 className="text-2xl font-bold">내 프로필</h1>
      <ProfileCard profile={profile} email={user.email} />
    </div>
  );
}
