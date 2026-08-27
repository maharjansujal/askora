import { useMutation } from "@tanstack/react-query";

type ResendEmailCodeInput = {
  userId: string;
};

type ResendEmailCodeResponse = {
  success: true;
};

type ApiError = {
  error: string;
};

export const useResendEmailCode = () => {
  return useMutation<ResendEmailCodeResponse, Error, ResendEmailCodeInput>({
    mutationFn: async ({ userId }) => {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = (await response.json()) as
        | ResendEmailCodeResponse
        | ApiError;

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Could not resend code");
      }

      return data as ResendEmailCodeResponse;
    },
  });
};
