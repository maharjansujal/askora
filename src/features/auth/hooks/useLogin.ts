"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export type LoginInput = {
  email: string;
  password: string;
};

type LoginResponse = {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
};

export type LoginError = {
  error: string;
  userId?: string;
  needsVerification?: boolean;
};

async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data as LoginError;
  }

  return data;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, LoginError, LoginInput>({
    mutationFn: login,
    onError: async (error) => {
      console.log(error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
    },
  });
}
