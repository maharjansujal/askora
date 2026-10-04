"use server";

import { prepareUpdatePayload } from "../../public/store/utils";

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
  const updatePayload = prepareUpdatePayload(formData);

  console.log(updatePayload);

  return { success: true, error: undefined };
};
