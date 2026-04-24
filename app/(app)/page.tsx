import {
  getClientSummaries,
  getClients,
  getOpenTodosWithClients,
} from "@/lib/queries";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { ClientTable } from "@/components/ClientTable";
import { GroupedTodoList } from "@/components/TodoList";
import { NewTodoModal } from "@/components/NewTodoModal";
import { Pill } from "@/components/ui/Pill";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [todos, clients, summaries] = await Promise.all([
    getOpenTodosWithClients(),
    getClients(),
    getClientSummaries(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[12px] text-ink-subtle tracking-wider uppercase mb-2">
            Dashboard
          </div>
          <div className="flex items-end gap-3">
            <h1 className="text-display">All To-Dos</h1>
            <Pill tone="pink" className="mb-2">
              {todos.length} open
            </Pill>
          </div>
        </div>
        <NewTodoModal clients={clients} />
      </header>

      <Card>
        <CardBody className="pt-2">
          <GroupedTodoList todos={todos} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Clients"
          subtitle={`${summaries.length} total`}
        />
        <CardBody className="pt-0">
          <ClientTable clients={summaries} columns={["openTodos", "progress"]} />
        </CardBody>
      </Card>
    </div>
  );
}
