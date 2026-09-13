"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/form/Input";
import { register, type RegisterState } from "../actions/register";

const initialState: RegisterState = {};

export const RegisterForm = () => {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(register, initialState);

  useEffect(() => {
    if (state.id) {
      router.push(`/verify-email?userId=${state.id}`);
    }
  }, [state.id, router]);

  return (
    <form action={formAction} className="space-y-5">
      <Input
        id="username"
        name="username"
        label="Username"
        placeholder="Enter your username"
        autoComplete="username"
        disabled={isPending}
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isPending}
      />

      <Input
        id="displayName"
        name="displayName"
        type="text"
        label="Display Name"
        placeholder="Your Name"
        disabled={isPending}
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="new-password"
        disabled={isPending}
      />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" loading={isPending} className="w-full">
        Create account
      </Button>

      <p className="text-center font-sans text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          Log in
        </Link>
      </p>
    </form>
  );
};
