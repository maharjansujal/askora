"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import { updateProfile, UpdateProfileState } from "../actions/updateProfile";
import { FormField } from "@/src/components/form/FormField";
import { Input } from "@/src/components/form/Input";
import { Camera } from "lucide-react";
import { Textarea } from "@/src/components/form/Textarea";
import { Button } from "@/src/components/ui/Button";

interface ProfileFormProps {
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  onSuccess?: (username: string) => void;
  onCancel?: () => void;
}

const initialState: UpdateProfileState = undefined;

export const ProfileForm = ({
  displayName,
  username,
  bio,
  avatarUrl,
  onSuccess,
  onCancel,
}: ProfileFormProps) => {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState,
  );
  useEffect(() => {
    if (state?.success && state.username) {
      onSuccess?.(state.username);
    }
  }, [state, onSuccess]);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  return (
    <form action={formAction} className="space-y-6 p-10">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative size-20 shrink-0 overflow-hidden rounded-full border border-border cursor-pointer"
        >
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-primary to-purple-300 text-2xl font-extrabold text-primary-foreground">
              {displayName.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-5 text-foreground" />
          </div>
        </button>
        <div>
          <p className="text-sm font-medium text-foreground">Profile photo</p>
          <p className="text-xs text-muted-foreground">
            PNG or JPG, up to 4MB.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="avatar"
          accept="image/png,image/jpeg"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <FormField label="Display name">
        <Input
          name="displayName"
          defaultValue={displayName ?? ""}
          placeholder="Your name"
          maxLength={50}
        />
      </FormField>

      <FormField label="Username">
        <Input
          name="username"
          defaultValue={username}
          placeholder="username"
          maxLength={30}
        />
      </FormField>

      <FormField
        label="Bio"
        message="A short intro shown on your profile. Max 280 characters."
      >
        <Textarea
          name="bio"
          defaultValue={bio ?? ""}
          placeholder="Tell people what you're good at…"
          rows={4}
          maxLength={280}
        />
      </FormField>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-success">Profile updated.</p>
      )}

      <div className="flex justify-end gap-2.5 border-t border-border pt-5">
        <Button type="button" variant="ghost" onClick={() => onCancel?.()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
};
