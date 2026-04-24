"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { TodoRow } from "@/components/TodoRow";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/utils";
import type { TodoWithClient } from "@/lib/types";

type Group = {
  clientId: string;
  clientName: string;
  todos: TodoWithClient[];
};

export function GroupedTodoList({ todos }: { todos: TodoWithClient[] }) {
  const grouped = groupByClient(todos);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (grouped.length === 0) {
    return (
      <div className="py-10 text-center text-[14px] text-ink-muted">
        Nothing open. Everything is done.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {grouped.map((g, idx) => {
        const isCollapsed = !!collapsed[g.clientId];
        return (
          <div
            key={g.clientId}
            className={cn(
              "py-4",
              idx < grouped.length - 1 && "border-b border-hairline",
            )}
          >
            <button
              type="button"
              onClick={() =>
                setCollapsed((s) => ({ ...s, [g.clientId]: !isCollapsed }))
              }
              className="flex items-center gap-2 w-full text-left group"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-ink-subtle transition-transform",
                  isCollapsed && "-rotate-90",
                )}
                strokeWidth={2}
              />
              <Link
                href={`/clients/${g.clientId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[13px] font-medium text-ink hover:underline underline-offset-2"
              >
                {g.clientName}
              </Link>
              <Pill tone="pink" className="ml-1">
                {g.todos.length} open
              </Pill>
            </button>

            {!isCollapsed && (
              <div className="mt-1 pl-6">
                {g.todos.map((t) => (
                  <TodoRow
                    key={t.id}
                    id={t.id}
                    title={t.title}
                    done={t.done}
                    fadeOnComplete
                    right={
                      <Link
                        href={`/clients/${g.clientId}`}
                        className="text-[11px] text-ink-muted hover:text-ink px-2 py-0.5 rounded-full bg-pill-neutral transition-colors"
                      >
                        {g.clientName}
                      </Link>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function groupByClient(todos: TodoWithClient[]): Group[] {
  const map = new Map<string, Group>();
  for (const t of todos) {
    const key = t.client.id;
    if (!map.has(key)) {
      map.set(key, { clientId: key, clientName: t.client.name, todos: [] });
    }
    map.get(key)!.todos.push(t);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.clientName.localeCompare(b.clientName),
  );
}
