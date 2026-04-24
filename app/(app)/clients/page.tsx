import { getClientSummaries } from "@/lib/queries";
import { Card, CardBody } from "@/components/Card";
import { ClientTable } from "@/components/ClientTable";
import { NewClientModal } from "@/components/NewClientModal";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const summaries = await getClientSummaries();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[12px] text-ink-subtle tracking-wider uppercase mb-2">
            Clients
          </div>
          <h1 className="text-display">
            {summaries.length === 1 ? "1 client" : `${summaries.length} clients`}
          </h1>
        </div>
        <NewClientModal />
      </header>

      <Card>
        <CardBody className="pt-4">
          <ClientTable
            clients={summaries}
            columns={["openTodos", "progress", "notes", "links"]}
          />
        </CardBody>
      </Card>
    </div>
  );
}
