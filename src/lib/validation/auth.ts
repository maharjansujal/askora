import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  displayName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  userId: z.uuid(),
  code: z.string().length(6).regex(/^\d+$/, "Code must be numeric"),
});

export const resendCodeSchema = z.object({
  userId: z.uuid(),
});
