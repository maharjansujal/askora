import { Button } from "@/src/components/ui/Button";
import { RegisterForm } from "@/src/features/auth/components/RegisterForm";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  return (
    <main className="relative flex h-full items-center justify-center bg-background px-4 py-20">
      <div className="absolute left-0 top-0 sm:left-8 sm:top-8">
        <Image
          src="/auth/logo.png"
          alt="Logo"
          width={50}
          height={50}
          priority
          className="h-auto w-10 invert dark:invert-0 sm:w-20 md:w-30"
        />
      </div>

      <div className="w-full max-w-[clamp(320px,90vw,420px)]">
        <div className="mb-8 text-center">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground">
            Create your account
          </h1>

          <p className="mt-2 font-sans text-sm text-muted-foreground">
            Sign up to get started
          </p>
        </div>

        <div className="space-y-3">
          <a href="/api/auth/login/google" className="block">
            <Button variant="outline">
              <FcGoogle className="size-5" />
              Continue with Google
            </Button>
          </a>

          <a href="/api/auth/login/github" className="block">
            <Button variant="outline">
              <FaGithub className="size-5" />
              Continue with GitHub
            </Button>
          </a>
        </div>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="font-sans text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}
