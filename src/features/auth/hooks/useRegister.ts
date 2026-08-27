import { useMutation } from "@tanstack/react-query";

type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

type RegisterResponse = {
  message?: string;
  error?: string;
  id?: string;
};

const register = async (data: RegisterInput): Promise<RegisterResponse> => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error ?? "Something went wrong. Please try again.");
  }

  return result;
};

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  });
};
