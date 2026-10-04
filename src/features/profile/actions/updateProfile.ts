"use server";

import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth/session";
import { uploadFile } from "@/src/lib/cloudinary";
import { eq, sql } from "drizzle-orm";

export type UpdateProfileState =
  | {
      success: boolean;
      error?: string;
      username?: string;
    }
  | undefined;

const MAX_AVATAR_SIZE = 4 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg"];

export const updateProfile = async (
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to update your profile.",
      };
    }

    const displayName = String(formData.get("displayName") ?? "").trim();

    const username = String(formData.get("username") ?? "")
      .trim()
      .toLowerCase();

    const bio = String(formData.get("bio") ?? "").trim();

    const avatar = formData.get("avatar");

    // Keep existing avatar unless a new one is uploaded.
    let avatarUrl = user.avatarUrl;
    let avatarPublicId = user.avatarPublicId;

    // Validate display name

    if (!displayName) {
      return {
        success: false,
        error: "Display name is required.",
      };
    }

    if (displayName.length > 50) {
      return {
        success: false,
        error: "Display name cannot exceed 50 characters.",
      };
    }

    // Validate username
    if (!username) {
      return {
        success: false,
        error: "Username is required.",
      };
    }

    if (username.length < 3 || username.length > 30) {
      return {
        success: false,
        error: "Username must be between 3 and 30 characters.",
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        success: false,
        error: "Username can only contain letters, numbers, and underscores.",
      };
    }

    const usernameChanged = username !== user.username.toLowerCase();

    if (usernameChanged) {
      const [existingUser] = await db
        .select({
          id: users.id,
        })
        .from(users)
        .where(
          sql`
            lower(${users.username}) = ${username}
            AND ${users.id} <> ${user.id}
          `,
        )
        .limit(1);

      if (existingUser) {
        return {
          success: false,
          error: "That username is already taken.",
        };
      }
    }
    // Validate bio
    if (bio.length > 280) {
      return {
        success: false,
        error: "Bio cannot exceed 280 characters.",
      };
    }
    // Handle avatar
    if (avatar instanceof File && avatar.size > 0) {
      if (avatar.size > MAX_AVATAR_SIZE) {
        return {
          success: false,
          error: "Profile photo must be smaller than 4MB.",
        };
      }

      if (!ALLOWED_AVATAR_TYPES.includes(avatar.type)) {
        return {
          success: false,
          error: "Profile photo must be a PNG or JPG image.",
        };
      }

      const uploaded = await uploadFile(avatar, {
        folder: "avatars",
        publicId: user.id,
      });

      avatarUrl = uploaded.fileUrl;
      avatarPublicId = uploaded.publicId;
    }

    // Update database

    await db
      .update(users)
      .set({
        displayName,
        username,
        bio: bio || null,
        avatarUrl,
        avatarPublicId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return {
      success: true,
      username,
    };
  } catch (error) {
    console.error("Profile update failed:", error);

    return {
      success: false,
      error: "Something went wrong while updating your profile.",
    };
  }
};
