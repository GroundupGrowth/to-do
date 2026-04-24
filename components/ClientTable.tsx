"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressDonut } from "@/components/ProgressDonut";
import { TagPill } from "@/components/TagPill";
import type { ClientSummary } from "@/lib/types";

type Column = "openTodos" | "progress" | "notes" | "links";

export function ClientTable({
  clients,
  columns = ["openTodos", "progress"],
}: {
  clients: ClientSummary[];
  columns?: Column[];
}) {
  const router = useRouter();

  if (clients.length === 0) {
    return (
      <div className="py-10 text-center text-[14px] text-ink-muted">
        No clients yet. Add one to get started.
      </div>
    );
  }

  const gridTemplate = `minmax(0,1fr) ${columns.map(() => "112px").join(" ")}`;

  return (
    <div>
      <div
        className="grid gap-4 px-2 py-2 text-[11px] uppercase tracking-wider text-ink-subtle"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <div>Company</div>
        {columns.includes("openTodos") && <div className="text-right">Open</div>}
        {columns.includes("progress") && <div className="text-right">Progress</div>}
        {columns.includes("notes") && <div className="text-right">Notes</div>}
        {columns.includes("links") && <div className="text-right">Links</div>}
      </div>

      <div className="divide-y divide-hairline border-t border-hairline">
        {clients.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => router.push(`/clients/${c.id}`)}
            className="grid gap-4 items-center px-2 py-3.5 text-left w-full transition-colors hover:bg-[#F7F7F5]"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar id={c.id} name={c.name} size={32} />
              <div className="min-w-0">
                <div className="text-[14px] font-medium truncate flex items-center gap-1.5 flex-wrap">
                  <span className="truncate">{c.name}</span>
                  {(c.tags ?? []).map((t) => (
                    <TagPill key={t} tag={t} size="xs" />
                  ))}
                </div>
                {c.description && (
                  <div className="text-[12px] text-ink-muted truncate">
                    {c.description}
                  </div>
                )}
              </div>
            </div>

            {columns.includes("openTodos") && (
              <div className="text-right text-[14px] tabular-nums">
                {c.openTodos}
                <span className="text-ink-subtle text-[12px]">
                  {" "}/ {c.totalTodos}
                </span>
              </div>
            )}

            {columns.includes("progress") && (
              <div className="flex items-center justify-end gap-2">
                <span className="text-[12px] text-ink-muted tabular-nums">
                  {c.progress}%
                </span>
                <ProgressDonut value={c.progress} />
              </div>
            )}

            {columns.includes("notes") && (
              <div className="text-right text-[14px] tabular-nums text-ink-muted">
                {c.notesCount === 0 ? "—" : "1"}
              </div>
            )}

            {columns.includes("links") && (
              <div className="text-right text-[14px] tabular-nums text-ink-muted">
                {c.linksCount === 0 ? "—" : c.linksCount}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
