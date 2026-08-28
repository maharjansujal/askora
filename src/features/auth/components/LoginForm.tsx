"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/form/Input";
import { LoginInput, useLogin } from "../hooks/useLogin";

export const LoginForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginInput>();

  const { mutate: login, isPending: loading, error } = useLogin();

  const onSubmit = (data: LoginInput) => {
    login(data, {
      onSuccess: () => {
        reset();
        router.push("/");
        router.refresh();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
        >
          {error.error}
        </p>
      )}

      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        disabled={loading}
        error={errors.email?.message}
        {...register("email", {
          required: "Email is required",
        })}
      />

      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        disabled={loading}
        error={errors.password?.message}
        {...register("password", {
          required: "Password is required",
        })}
      />

      <Button type="submit" loading={loading} className="w-full">
        Login
      </Button>

      <p className="text-center font-sans text-[13px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          Register
        </Link>
      </p>
    </form>
  );
};
