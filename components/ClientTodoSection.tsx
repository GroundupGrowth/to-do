"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { TodoRow } from "@/components/TodoRow";
import { createTodo } from "@/lib/mutations";
import { cn } from "@/lib/utils";
import type { Todo } from "@/lib/types";

export function ClientTodoSection({
  clientId,
  todos,
}: {
  clientId: string;
  todos: Todo[];
}) {
  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        await createTodo({ title: trimmed, clientId });
        setTitle("");
      } catch {
        // Ignore — revalidation will resync.
      }
    });
  }

  return (
    <div>
      {open.length === 0 ? (
        <div className="py-6 text-[13px] text-ink-subtle text-center">
          Nothing open.
        </div>
      ) : (
        <div>
          {open.map((t) => (
            <TodoRow
              key={t.id}
              id={t.id}
              title={t.title}
              done={t.done}
              fadeOnComplete
            />
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="mt-2 flex items-center gap-2">
        <div className="h-[18px] w-[18px] rounded-md border border-dashed border-[#D4D3CF] grid place-items-center text-ink-subtle">
          <Plus className="h-3 w-3" strokeWidth={2} />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a to-do…"
          disabled={isPending}
          className="flex-1 bg-transparent border-0 outline-0 text-[14px] py-2 placeholder:text-ink-subtle"
        />
      </form>

      {done.length > 0 && (
        <div className="mt-4 pt-4 border-t border-hairline">
          <button
            type="button"
            onClick={() => setCompletedOpen((v) => !v)}
            className="flex items-center gap-2 text-[12px] text-ink-muted hover:text-ink transition-colors"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                !completedOpen && "-rotate-90",
              )}
              strokeWidth={2}
            />
            Completed ({done.length})
          </button>

          {completedOpen && (
            <div className="mt-1">
              {done.map((t) => (
                <TodoRow key={t.id} id={t.id} title={t.title} done={t.done} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
