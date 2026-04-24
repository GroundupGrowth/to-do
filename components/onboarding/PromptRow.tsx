"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, ChevronDown, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteOnboardingPrompt } from "@/lib/mutations";
import type { OnboardingPrompt } from "@/lib/types";

export function PromptRow({ prompt }: { prompt: OnboardingPrompt }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopied(true);
    } catch {
      // ignore
    }
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteOnboardingPrompt(prompt.id);
      } catch {}
    });
  }

  return (
    <div className="group border border-hairline rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#FAFAF8]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
          aria-expanded={open}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-ink-subtle transition-transform",
              !open && "-rotate-90",
            )}
            strokeWidth={2}
          />
          <span className="text-[13px] font-medium text-ink truncate">
            {prompt.label}
          </span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors",
            copied
              ? "bg-pill-green text-pill-greenInk"
              : "bg-white border border-hairline text-ink hover:bg-[#F3F3F0]",
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" strokeWidth={2.5} />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" strokeWidth={1.75} />
              Copy
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          aria-label="Delete prompt"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-ink-subtle hover:text-accent"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      {open && (
        <pre className="px-3 py-3 text-[12.5px] leading-5 text-ink whitespace-pre-wrap break-words font-mono bg-white border-t border-hairline">
          {prompt.body}
        </pre>
      )}
    </div>
  );
}
