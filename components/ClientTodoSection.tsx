"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { createTodo } from "@/lib/mutations";
import type { Todo } from "@/lib/types";

export function ClientTodoSection({
  clientId,
  todos,
}: {
  clientId: string;
  todos: Todo[];
}) {
  const active = todos.filter((t) => !t.done);
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
      } catch {}
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <KanbanBoard todos={active} showClientTag={false} />

      <form
        onSubmit={handleAdd}
        className="flex items-center gap-2 px-3 py-2 bg-[#FAFAF8] rounded-xl border border-hairline"
      >
        <Plus className="h-4 w-4 text-ink-subtle" strokeWidth={1.75} />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a to-do — drops into the To Do column"
          disabled={isPending}
          className="flex-1 bg-transparent border-0 outline-0 text-[14px] placeholder:text-ink-subtle"
        />
      </form>
    </div>
  );
}
