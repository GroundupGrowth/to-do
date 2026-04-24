import {
  getClients,
  getInboxTodos,
  getOpenTodosWithClients,
} from "@/lib/queries";
import { InboxCard } from "@/components/InboxCard";
import { KanbanBoard } from "@/components/KanbanBoard";
import { NewTodoModal } from "@/components/NewTodoModal";
import { Pill } from "@/components/ui/Pill";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [todos, clients, inbox] = await Promise.all([
    getOpenTodosWithClients(),
    getClients(),
    getInboxTodos(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[12px] text-ink-subtle tracking-wider uppercase mb-2">
            Dashboard
          </div>
          <div className="flex items-end gap-3">
            <h1 className="text-display">Board</h1>
            <Pill tone="pink" className="mb-2">
              {todos.length} open
            </Pill>
          </div>
        </div>
        <NewTodoModal clients={clients} />
      </header>

      <KanbanBoard todos={todos} />

      <InboxCard todos={inbox} />
    </div>
  );
}
