import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-9 w-9 rounded-lg bg-ink text-white grid place-items-center font-semibold tracking-tight">
            PM
          </div>
          <div className="text-[16px] font-semibold tracking-tight">PM</div>
        </div>

        <div className="bg-card rounded-2xl border border-hairline p-6">
          <h1 className="text-[20px] font-semibold tracking-tight mb-1">
            Sign in
          </h1>
          <p className="text-[13px] text-ink-muted mb-5">
            Enter your email to receive a magic link.
          </p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
