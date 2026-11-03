import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type VerifyEmailInput = {
  userId: string;
  code: string;
};

type VerifyEmailResponse = {
  success: true;
};

type ApiError = {
  error: string;
};

export const useVerifyEmail = () => {
  return useMutation<VerifyEmailResponse, Error, VerifyEmailInput>({
    mutationFn: async ({ userId, code }) => {
      try {
        const response = await axios.post<VerifyEmailResponse>(
          "/api/auth/verify-email",
          { userId, code },
        );

        return response.data;
      } catch (error) {
        if (axios.isAxiosError<ApiError>(error)) {
          throw new Error(
            error.response?.data?.error ?? "Failed to verify email",
          );
        }

        throw error;
      }
    },
  });
};
