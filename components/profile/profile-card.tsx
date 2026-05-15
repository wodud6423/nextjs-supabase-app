import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/lib/supabase/types";

interface ProfileCardProps {
  profile: Profile;
  email?: string;
}

export function ProfileCard({ profile, email }: ProfileCardProps) {
  const displayName = profile.full_name || profile.username || email || "사용자";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">{displayName}</h2>
          {profile.username && (
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline underline-offset-4"
          >
            {profile.website}
          </a>
        )}
        {email && (
          <p className="text-sm text-muted-foreground">{email}</p>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href="/protected/profile/edit">프로필 편집</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
