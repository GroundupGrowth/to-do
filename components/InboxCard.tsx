"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowRightFromLine,
  Inbox as InboxIcon,
  MessageSquareText,
  Trash2,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { TodoCardModal } from "@/components/TodoCardModal";
import { deleteTodo, triageTodo } from "@/lib/mutations";
import type { TodoWithClient } from "@/lib/types";
import { cn, tintFor } from "@/lib/utils";

export function InboxCard({ todos: initial }: { todos: TodoWithClient[] }) {
  const [items, setItems] = useState<TodoWithClient[]>(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  const openTodo = openId ? items.find((t) => t.id === openId) ?? null : null;

  function patchItem(id: string, patch: Partial<TodoWithClient>) {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? ({ ...t, ...patch } as TodoWithClient) : t)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  function handleTriage(id: string) {
    setLeaving((s) => ({ ...s, [id]: true }));
    startTransition(async () => {
      try {
        await triageTodo(id);
        removeItem(id);
      } catch {
        setLeaving((s) => ({ ...s, [id]: false }));
      }
    });
  }

  function handleDelete(id: string) {
    setLeaving((s) => ({ ...s, [id]: true }));
    startTransition(async () => {
      try {
        await deleteTodo(id);
        removeItem(id);
      } catch {
        setLeaving((s) => ({ ...s, [id]: false }));
      }
    });
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
              ? "Emails land here first. Send them to the board when you're ready."
              : `${items.length} waiting to triage`
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
                <InboxRow
                  key={t.id}
                  todo={t}
                  leaving={!!leaving[t.id]}
                  onOpen={() => setOpenId(t.id)}
                  onTriage={() => handleTriage(t.id)}
                  onDelete={() => handleDelete(t.id)}
                />
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

function InboxRow({
  todo,
  leaving,
  onOpen,
  onTriage,
  onDelete,
}: {
  todo: TodoWithClient;
  leaving: boolean;
  onOpen: () => void;
  onTriage: () => void;
  onDelete: () => void;
}) {
  const tint = todo.client ? tintFor(todo.client.id) : null;

  return (
    <li
      className={cn(
        "group flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg transition-all",
        "hover:bg-[#F7F7F5]",
        leaving && "row-leaving",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 min-w-0 flex items-start gap-3 text-left"
      >
        {tint && todo.client && (
          <Link
            href={`/clients/${todo.client.id}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 h-6 rounded-full px-2 inline-flex items-center text-[11px] font-medium hover:opacity-90 transition-opacity"
            style={{ background: tint.bg, color: tint.fg }}
          >
            {todo.client.name}
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] text-ink truncate">{todo.title}</div>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-ink-subtle">
            <span>{formatRelative(todo.created_at)}</span>
            {(todo.notes_count ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquareText className="h-3 w-3" strokeWidth={1.75} />
                {todo.notes_count}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete"
          className="h-8 w-8 grid place-items-center rounded-full text-ink-subtle hover:text-accent hover:bg-white transition-colors"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onTriage}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-ink text-white text-[12px] font-medium hover:bg-[#2A2927] transition-colors"
        >
          Send to board
          <ArrowRightFromLine className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </li>
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
