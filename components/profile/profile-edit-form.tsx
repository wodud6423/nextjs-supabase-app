"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "닉네임은 최소 3자 이상이어야 합니다.")
    .max(30, "닉네임은 최대 30자까지 입력 가능합니다.")
    .regex(/^[a-z0-9_]+$/, "소문자, 숫자, 언더스코어만 사용 가능합니다.")
    .or(z.literal("")),
  full_name: z.string().max(100, "이름은 최대 100자까지 입력 가능합니다.").optional(),
  bio: z.string().max(500, "자기소개는 최대 500자까지 입력 가능합니다.").optional(),
  website: z
    .string()
    .regex(/^https?:\/\//, "URL은 http:// 또는 https://로 시작해야 합니다.")
    .or(z.literal(""))
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  initialData: Profile | null;
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: initialData?.username ?? "",
      full_name: initialData?.full_name ?? "",
      bio: initialData?.bio ?? "",
      website: initialData?.website ?? "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("인증이 필요합니다.");
      setIsLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: values.username || null,
        full_name: values.full_name || null,
        bio: values.bio || null,
        website: values.website || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    router.push("/protected/profile");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full max-w-md">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">닉네임</Label>
        <Input
          id="username"
          placeholder="소문자, 숫자, 언더스코어만 사용 가능"
          {...register("username")}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="full_name">이름</Label>
        <Input
          id="full_name"
          placeholder="표시될 이름을 입력하세요"
          {...register("full_name")}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">자기소개</Label>
        <Textarea
          id="bio"
          placeholder="자기소개를 입력하세요 (최대 500자)"
          rows={4}
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="website">웹사이트</Label>
        <Input
          id="website"
          placeholder="https://example.com"
          {...register("website")}
        />
        {errors.website && (
          <p className="text-sm text-destructive">{errors.website.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "저장 중..." : "저장"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          취소
        </Button>
      </div>
    </form>
  );
}
