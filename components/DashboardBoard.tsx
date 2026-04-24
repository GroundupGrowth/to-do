"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { NewTodoModal } from "@/components/NewTodoModal";
import type { Client, TodoStatus, TodoWithClient } from "@/lib/types";

export function DashboardBoard({
  todos,
  clients,
}: {
  todos: TodoWithClient[];
  clients: Client[];
}) {
  const [addStatus, setAddStatus] = useState<TodoStatus | null>(null);

  return (
    <>
      <KanbanBoard
        todos={todos}
        onColumnAdd={(status) => setAddStatus(status)}
      />
      <NewTodoModal
        clients={clients}
        open={addStatus !== null}
        onOpenChange={(v) => {
          if (!v) setAddStatus(null);
        }}
        defaultStatus={addStatus ?? "todo"}
      />
    </>
  );
}
