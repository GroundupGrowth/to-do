"use client";

import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { cn, tintFor } from "@/lib/utils";
import { deleteTodo, updateTodoStatus } from "@/lib/mutations";
import { TODO_STAGES, type TodoStatus, type TodoWithClient } from "@/lib/types";

const STAGE_META: Record<TodoStatus, { label: string; tone: string }> = {
  todo:        { label: "To Do",       tone: "#141413" },
  in_progress: { label: "In Progress", tone: "#B93963" },
  questions:   { label: "Questions",   tone: "#6E5A36" },
  postpone:    { label: "Postpone",    tone: "#5C5B57" },
};

type DropTarget = TodoStatus | "done";

export function KanbanBoard({ todos }: { todos: TodoWithClient[] }) {
  const [items, setItems] = useState<TodoWithClient[]>(todos);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overTarget, setOverTarget] = useState<DropTarget | null>(null);
  const [, startTransition] = useTransition();

  // Sync with server whenever the prop changes (after revalidation).
  useEffect(() => {
    setItems(todos);
  }, [todos]);

  function handleDrop(target: DropTarget) {
    const id = draggingId;
    setDraggingId(null);
    setOverTarget(null);
    if (!id) return;

    const todo = items.find((t) => t.id === id);
    if (!todo) return;

    if (target === "done") {
      setItems((prev) => prev.filter((t) => t.id !== id));
      startTransition(async () => {
        try {
          await deleteTodo(id);
        } catch {
          // Revalidation will resync on next render.
        }
      });
      return;
    }

    if (todo.status === target) return;

    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: target } : t)),
    );
    startTransition(async () => {
      try {
        await updateTodoStatus(id, target);
      } catch {
        // noop
      }
    });
  }

  const grouped: Record<TodoStatus, TodoWithClient[]> = {
    todo: [],
    in_progress: [],
    questions: [],
    postpone: [],
  };
  for (const t of items) {
    if (grouped[t.status]) grouped[t.status].push(t);
    else grouped.todo.push(t);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {TODO_STAGES.map((stage) => (
        <Column
          key={stage}
          label={STAGE_META[stage].label}
          tone={STAGE_META[stage].tone}
          count={grouped[stage].length}
          isOver={overTarget === stage}
          onDragOver={(e) => {
            e.preventDefault();
            if (overTarget !== stage) setOverTarget(stage);
          }}
          onDragLeave={() =>
            setOverTarget((cur) => (cur === stage ? null : cur))
          }
          onDrop={() => handleDrop(stage)}
        >
          {grouped[stage].length === 0 ? (
            <EmptyColumn />
          ) : (
            grouped[stage].map((t) => (
              <KanbanCard
                key={t.id}
                todo={t}
                dragging={draggingId === t.id}
                onDragStart={() => setDraggingId(t.id)}
                onDragEnd={() => {
                  setDraggingId(null);
                  setOverTarget(null);
                }}
              />
            ))
          )}
        </Column>
      ))}

      <DoneZone
        isOver={overTarget === "done"}
        onDragOver={(e) => {
          e.preventDefault();
          if (overTarget !== "done") setOverTarget("done");
        }}
        onDragLeave={() =>
          setOverTarget((cur) => (cur === "done" ? null : cur))
        }
        onDrop={() => handleDrop("done")}
      />
    </div>
  );
}

function Column({
  label,
  tone,
  count,
  isOver,
  children,
  ...drag
}: {
  label: string;
  tone: string;
  count: number;
  isOver: boolean;
  children: React.ReactNode;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      {...drag}
      className={cn(
        "shrink-0 w-[260px] bg-[#FAFAF8] rounded-2xl border border-hairline p-3 transition-colors",
        isOver && "border-accent bg-accent-soft/40",
      )}
    >
      <header className="flex items-center justify-between px-1.5 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: tone }}
            aria-hidden
          />
          <span className="text-[12px] font-semibold tracking-tight text-ink">
            {label}
          </span>
        </div>
        <span className="text-[11px] text-ink-subtle tabular-nums">{count}</span>
      </header>

      <div className="flex flex-col gap-2 min-h-[80px]">{children}</div>
    </div>
  );
}

function EmptyColumn() {
  return (
    <div className="text-center text-[12px] text-ink-subtle py-6">Empty</div>
  );
}

function KanbanCard({
  todo,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  todo: TodoWithClient;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const tint = tintFor(todo.client.id);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        // Firefox requires dataTransfer to be set for drag to work.
        e.dataTransfer.setData("text/plain", todo.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "bg-white rounded-xl border border-hairline p-3 cursor-grab active:cursor-grabbing transition-all",
        "hover:border-[#D4D3CF] hover:shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_4px_12px_-6px_rgba(0,0,0,0.08)]",
        dragging && "opacity-40",
      )}
    >
      <div className="text-[13px] leading-5 text-ink">{todo.title}</div>
      <Link
        href={`/clients/${todo.client.id}`}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium hover:opacity-90 transition-opacity"
        style={{ background: tint.bg, color: tint.fg }}
      >
        {todo.client.name}
      </Link>
    </div>
  );
}

function DoneZone({
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  isOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "shrink-0 w-[120px] rounded-2xl border border-dashed p-3 flex flex-col items-center justify-center text-center transition-colors",
        isOver
          ? "border-accent bg-accent-soft/50 text-accent"
          : "border-[#D4D3CF] text-ink-subtle",
      )}
    >
      <Trash2 className="h-4 w-4 mb-1.5" strokeWidth={1.75} />
      <div className="text-[11px] font-semibold tracking-tight">Done</div>
      <div className="text-[10px] leading-tight mt-0.5">Drop to delete</div>
    </div>
  );
}
