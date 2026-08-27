"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useVerifyEmail } from "@/src/features/auth/hooks/useVerifyEmail";
import { Input } from "@/src/components/form/Input";
import { Button } from "@/src/components/ui/Button";
import { useResendEmailCode } from "@/src/features/auth/hooks/useResendEmailCode";

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("userId");

  const [code, setCode] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  const {
    mutate: verifyEmail,
    isPending: isVerifying,
    error: verifyError,
  } = useVerifyEmail();

  const {
    mutate: resendCode,
    isPending: isResending,
    error: resendError,
  } = useResendEmailCode();

  const error = verifyError?.message ?? resendError?.message ?? null;

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Missing user reference. Please register or log in again.
          </p>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setInfo(null);
    if (!userId) return;

    verifyEmail(
      { userId, code },
      {
        onSuccess: () => {
          router.push("/login?verified=1");
        },
      },
    );
  }

  function handleResend() {
    setInfo(null);
    if (!userId) return;

    resendCode(
      { userId },
      {
        onSuccess: () => {
          setInfo("A new code has been sent to your email.");
        },
      },
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-background p-8 shadow-sm"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>

          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code we sent to your email address.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {info && (
          <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {info}
          </div>
        )}

        <Input
          inputMode="numeric"
          maxLength={6}
          required
          autoComplete="one-time-code"
          placeholder="000000"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ""));
          }}
          className="h-12 text-center text-2xl tracking-[0.5em]"
        />

        <Button
          type="submit"
          disabled={isVerifying || code.length !== 6}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>

        <Button
          type="button"
          onClick={handleResend}
          disabled={isResending || isVerifying}
          className="w-full"
        >
          {isResending ? "Sending..." : "Resend code"}
        </Button>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
