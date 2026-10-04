"use server";

export type UpdateProfileState =
  | {
      success: boolean;
      error?: string;
    }
  | undefined;

export const updateProfile = async (
  _prevState: UpdateProfileState,
  formData: FormData,
) => {
  console.log("updateProfile formData:", {
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    bio: formData.get("bio"),
    avatar: formData.get("avatar"), // a File when selected
  });

  return { success: true, error: undefined };
};
