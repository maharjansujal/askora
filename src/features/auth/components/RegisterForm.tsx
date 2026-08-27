"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/src/lib/validation/auth";
import { useRegister } from "../hooks/useRegister";
import { Input } from "@/src/components/form/Input";
import { Button } from "@/src/components/ui/Button";
import Link from "next/link";

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();

  const { mutate: register, isPending, error } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    register(data, {
      onSuccess: (result) => {
        console.log(result);
        router.push(`/verify-email?userId=${result.id}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Username"
        placeholder="Enter your username"
        autoComplete="username"
        error={errors.username?.message}
        {...registerField("username")}
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...registerField("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...registerField("password")}
      />

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p style={{ fontSize: 13, textAlign: "center", marginTop: 4 }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
};
