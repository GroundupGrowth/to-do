"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Inbox as InboxIcon, MessageSquareText } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { AssigneeChip } from "@/components/AssigneeChip";
import { TodoCardModal } from "@/components/TodoCardModal";
import type { TodoWithClient } from "@/lib/types";
import { cn } from "@/lib/utils";

export function InboxCard({
  clientId,
  todos: initial,
}: {
  clientId: string | null;
  todos: TodoWithClient[];
}) {
  const [items, setItems] = useState<TodoWithClient[]>(initial);
  const [openId, setOpenId] = useState<string | null>(null);

  const openTodo = openId ? items.find((t) => t.id === openId) ?? null : null;

  function patchItem(id: string, patch: Partial<TodoWithClient>) {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? ({ ...t, ...patch } as TodoWithClient) : t)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <>
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <InboxIcon className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
              Inbox
            </span>
          }
          subtitle={
            items.length === 0
              ? "Emails sent to your Postmark inbound address land here."
              : `${items.length} waiting to triage`
          }
          right={
            clientId && (
              <Link
                href={`/clients/${clientId}`}
                className="text-[12px] text-ink-muted hover:text-ink inline-flex items-center gap-1 transition-colors"
              >
                Open board
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            )
          }
        />
        <CardBody className="pt-0">
          {items.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-ink-subtle">
              Nothing new. When an email comes in, it'll show up here.
            </div>
          ) : (
            <ul className="divide-y divide-hairline">
              {items.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(t.id)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 py-3 px-2 -mx-2 rounded-lg transition-colors",
                      "hover:bg-[#F7F7F5]",
                    )}
                  >
                    <AssigneeChip
                      assignee={t.assignee ?? null}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-ink truncate">
                        {t.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-[11px] text-ink-subtle">
                        <span>{formatRelative(t.created_at)}</span>
                        {(t.notes_count ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <MessageSquareText
                              className="h-3 w-3"
                              strokeWidth={1.75}
                            />
                            {t.notes_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <TodoCardModal
        todo={openTodo}
        open={openId !== null}
        onOpenChange={(v) => !v && setOpenId(null)}
        onLocalUpdate={(patch) => {
          if (openId) patchItem(openId, patch as Partial<TodoWithClient>);
        }}
        onLocalNotesDelta={(delta) => {
          if (openId) {
            const current = items.find((t) => t.id === openId);
            const next = Math.max(0, (current?.notes_count ?? 0) + delta);
            patchItem(openId, { notes_count: next });
          }
        }}
        onLocalComplete={() => {
          if (openId) removeItem(openId);
        }}
      />
    </>
  );
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.round(diff / min)}m ago`;
  if (diff < day) return `${Math.round(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.round(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
