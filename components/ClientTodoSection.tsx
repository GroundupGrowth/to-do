"use client";

import { KanbanBoard } from "@/components/KanbanBoard";
import type { Todo } from "@/lib/types";

export function ClientTodoSection({
  clientId,
  todos,
}: {
  clientId: string;
  todos: Todo[];
}) {
  const active = todos.filter((t) => !t.done);
  return (
    <KanbanBoard
      todos={active}
      showClientTag={false}
      inlineAddClientId={clientId}
    />
  );
}
