import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getClient,
  getLinksForClient,
  getTodosForClient,
} from "@/lib/queries";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { ClientTodoSection } from "@/components/ClientTodoSection";
import { NotesEditor } from "@/components/NotesEditor";
import { LinksList } from "@/components/LinksList";
import { EditableClientName } from "@/components/EditableClientName";
import { ProgressDonut } from "@/components/ProgressDonut";
import { Pill } from "@/components/ui/Pill";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const [todos, links] = await Promise.all([
    getTodosForClient(id),
    getLinksForClient(id),
  ]);

  const open = todos.filter((t) => !t.done).length;
  const done = todos.filter((t) => t.done).length;
  const progress = todos.length === 0 ? 0 : Math.round((done / todos.length) * 100);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted hover:text-ink transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Clients
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <EditableClientName id={client.id} initialName={client.name} />
          {client.description && (
            <p className="mt-2 text-[14px] text-ink-muted max-w-xl">
              {client.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <Pill tone="pink">{open} open</Pill>
            {done > 0 && <Pill tone="green">{done} done</Pill>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ink-muted tabular-nums">
            {progress}% complete
          </span>
          <ProgressDonut value={progress} size={36} stroke={4} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="To-Dos"
            subtitle={
              todos.length === 0
                ? "None yet"
                : `${open} open · ${done} completed`
            }
          />
          <CardBody className="pt-0">
            <ClientTodoSection clientId={client.id} todos={todos} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Notes" subtitle="One long notepad" />
          <CardBody className="pt-0">
            <NotesEditor clientId={client.id} initialValue={client.notes ?? ""} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Links"
            subtitle={links.length === 0 ? "None yet" : `${links.length} total`}
          />
          <CardBody className="pt-0">
            <LinksList clientId={client.id} links={links} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
