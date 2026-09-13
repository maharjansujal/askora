"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/form/Input";
import { login, type LoginState } from "../actions/login";

const initialState: LoginState = {};

export const LoginForm = () => {
  const [state, formAction, loading] = useActionState(login, initialState);

  return (
    <form action={formAction} className="w-full space-y-5">
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        disabled={loading}
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        disabled={loading}
      />

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

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
