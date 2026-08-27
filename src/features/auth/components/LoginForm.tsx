"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/src/components/ui/Button";
import { LoginInput, useLogin } from "../hooks/useLogin";
import { Input } from "@/src/components/form/Input";
import Link from "next/link";

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
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <p role="alert">{error.error}</p>}

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

      <Button type="submit" loading={loading}>
        Login
      </Button>
      <p style={{ fontSize: 13, textAlign: "center", marginTop: 4 }}>
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </form>
  );
};
