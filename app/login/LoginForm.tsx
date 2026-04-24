"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("sent");
        setMessage("Check your email for a magic link.");
      }
    });
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />
        <Button type="submit" disabled={isPending || !email.trim()}>
          {isPending ? "Sending…" : "Send magic link"}
        </Button>
      </form>

      {message && (
        <div
          className={`mt-4 text-[13px] ${
            status === "error" ? "text-accent" : "text-pill-greenInk"
          }`}
        >
          {message}
        </div>
      )}
    </>
  );
}
