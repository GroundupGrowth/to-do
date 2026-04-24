"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleTodo } from "@/lib/mutations";
import { cn } from "@/lib/utils";

export function TodoRow({
  id,
  title,
  done,
  right,
  /** When true, checking fades the row out before it disappears on refresh. */
  fadeOnComplete = false,
}: {
  id: string;
  title: string;
  done: boolean;
  right?: React.ReactNode;
  fadeOnComplete?: boolean;
}) {
  const [optimisticDone, setOptimisticDone] = useState(done);
  const [leaving, setLeaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !optimisticDone;
    setOptimisticDone(next);
    if (fadeOnComplete && next) {
      setLeaving(true);
    }
    startTransition(async () => {
      try {
        await toggleTodo(id, next);
      } catch {
        setOptimisticDone(!next);
        setLeaving(false);
      }
    });
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-colors hover:bg-[#F7F7F5]",
        leaving && "row-leaving",
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={optimisticDone}
        aria-label={optimisticDone ? "Mark as not done" : "Mark as done"}
        disabled={isPending && leaving}
        className={cn(
          "shrink-0 h-[18px] w-[18px] rounded-md border transition-colors grid place-items-center",
          optimisticDone
            ? "bg-accent border-accent text-white"
            : "bg-white border-[#D4D3CF] hover:border-ink-muted",
        )}
      >
        {optimisticDone && (
          <Check className="h-3 w-3 checkbox-check" strokeWidth={3} />
        )}
      </button>

      <span
        className={cn(
          "flex-1 text-[14px] leading-5 transition-colors",
          optimisticDone ? "text-ink-subtle line-through" : "text-ink",
        )}
      >
        {title}
      </span>

      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
