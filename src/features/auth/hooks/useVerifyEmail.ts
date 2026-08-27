import { useMutation } from "@tanstack/react-query";

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
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, code }),
      });

      const data = (await response.json()) as VerifyEmailResponse | ApiError;

      if (!response.ok) {
        throw new Error(
          "error" in data ? data.error : "Failed to verify email",
        );
      }

      return data as VerifyEmailResponse;
    },
  });
};
