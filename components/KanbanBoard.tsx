"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { MessageSquareText, Plus, Trash2 } from "lucide-react";
import { cn, tintFor } from "@/lib/utils";
import { completeTodo, createTodo, updateTodoStatus } from "@/lib/mutations";
import {
  TODO_STAGES,
  type Assignee,
  type Todo,
  type TodoStatus,
  type TodoWithClient,
} from "@/lib/types";
import { AssigneeChip } from "@/components/AssigneeChip";
import { TodoCardModal } from "@/components/TodoCardModal";

const STAGE_META: Record<TodoStatus, { label: string; tone: string }> = {
  todo:        { label: "To Do",       tone: "#141413" },
  in_progress: { label: "In Progress", tone: "#B93963" },
  questions:   { label: "Questions",   tone: "#6E5A36" },
  postpone:    { label: "Postpone",    tone: "#5C5B57" },
};

type DropTarget = TodoStatus | "done";
type BoardTodo = (Todo | TodoWithClient) & {
  notes_count?: number;
  client?: { id: string; name: string };
};

export function KanbanBoard<T extends BoardTodo>({
  todos,
  showClientTag = true,
  inlineAddClientId,
  onColumnAdd,
}: {
  todos: T[];
  showClientTag?: boolean;
  /** When set, clicking the column "+" reveals an inline input that creates
   *  a todo for this client in that column. */
  inlineAddClientId?: string;
  /** When set (and inlineAddClientId is not), clicking "+" calls this with
   *  the column status — parent decides what UI to show (e.g. open a modal
   *  with status pre-filled). */
  onColumnAdd?: (status: TodoStatus) => void;
}) {
  const [items, setItems] = useState<T[]>(todos);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overTarget, setOverTarget] = useState<DropTarget | null>(null);
  const [openTodoId, setOpenTodoId] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<TodoStatus | null>(null);
  const [, startTransition] = useTransition();

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
          await completeTodo(id);
        } catch {}
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
      } catch {}
    });
  }

  function patchItem(id: string, patch: Partial<BoardTodo>) {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? ({ ...t, ...patch } as T) : t)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }

  const grouped: Record<TodoStatus, T[]> = {
    todo: [],
    in_progress: [],
    questions: [],
    postpone: [],
  };
  for (const t of items) {
    if (grouped[t.status]) grouped[t.status].push(t);
    else grouped.todo.push(t);
  }

  const openTodo = openTodoId ? items.find((t) => t.id === openTodoId) ?? null : null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {TODO_STAGES.map((stage) => {
          const canAdd = !!inlineAddClientId || !!onColumnAdd;
          return (
            <Column
              key={stage}
              label={STAGE_META[stage].label}
              tone={STAGE_META[stage].tone}
              count={grouped[stage].length}
              isOver={overTarget === stage}
              onAdd={
                canAdd
                  ? () => {
                      if (inlineAddClientId) {
                        setAddingTo((cur) => (cur === stage ? null : stage));
                      } else if (onColumnAdd) {
                        onColumnAdd(stage);
                      }
                    }
                  : undefined
              }
              onDragOver={(e) => {
                e.preventDefault();
                if (overTarget !== stage) setOverTarget(stage);
              }}
              onDragLeave={() =>
                setOverTarget((cur) => (cur === stage ? null : cur))
              }
              onDrop={() => handleDrop(stage)}
            >
              {inlineAddClientId && addingTo === stage && (
                <InlineAddForm
                  clientId={inlineAddClientId}
                  status={stage}
                  onClose={() => setAddingTo(null)}
                />
              )}
              {grouped[stage].length === 0 && addingTo !== stage ? (
                <EmptyColumn />
              ) : (
                grouped[stage].map((t) => (
                  <KanbanCard
                    key={t.id}
                    todo={t}
                    showClientTag={showClientTag}
                    dragging={draggingId === t.id}
                    onDragStart={() => setDraggingId(t.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverTarget(null);
                    }}
                    onOpen={() => setOpenTodoId(t.id)}
                  />
                ))
              )}
            </Column>
          );
        })}

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

      <TodoCardModal
        todo={openTodo as BoardTodo | null}
        open={openTodoId !== null}
        onOpenChange={(v) => !v && setOpenTodoId(null)}
        onLocalUpdate={(patch) => {
          if (openTodoId) patchItem(openTodoId, patch);
        }}
        onLocalNotesDelta={(delta) => {
          if (openTodoId) {
            const current = items.find((t) => t.id === openTodoId);
            const next = Math.max(0, (current?.notes_count ?? 0) + delta);
            patchItem(openTodoId, { notes_count: next });
          }
        }}
        onLocalComplete={() => {
          if (openTodoId) removeItem(openTodoId);
        }}
      />
    </>
  );
}

function Column({
  label,
  tone,
  count,
  isOver,
  onAdd,
  children,
  ...drag
}: {
  label: string;
  tone: string;
  count: number;
  isOver: boolean;
  onAdd?: () => void;
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
      <header className="group flex items-center justify-between px-1.5 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: tone }}
            aria-hidden
          />
          <span className="text-[12px] font-semibold tracking-tight text-ink">
            {label}
          </span>
          <span className="text-[11px] text-ink-subtle tabular-nums">
            {count}
          </span>
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add to ${label}`}
            className="h-6 w-6 grid place-items-center rounded-md text-ink-subtle hover:text-ink hover:bg-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </header>

      <div className="flex flex-col gap-2 min-h-[80px]">{children}</div>
    </div>
  );
}

function InlineAddForm({
  clientId,
  status,
  onClose,
}: {
  clientId: string;
  status: TodoStatus;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        await createTodo({ title: trimmed, clientId, status });
        setTitle("");
        // Keep form open for rapid entry of multiple cards.
      } catch {}
    });
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-xl border border-accent/40 p-2 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.08)]"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        placeholder="New task title…"
        disabled={isPending}
        className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-subtle px-1 py-1"
      />
      <div className="flex items-center justify-end gap-1 mt-1">
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-ink-muted hover:text-ink px-2 py-1 rounded transition-colors"
        >
          Done
        </button>
        <button
          type="submit"
          disabled={!title.trim() || isPending}
          className="text-[11px] font-medium text-white bg-ink hover:bg-[#2A2927] disabled:opacity-40 disabled:pointer-events-none px-2 py-1 rounded transition-colors"
        >
          Add
        </button>
      </div>
    </form>
  );
}

function EmptyColumn() {
  return (
    <div className="text-center text-[12px] text-ink-subtle py-6">Empty</div>
  );
}

function KanbanCard({
  todo,
  showClientTag,
  dragging,
  onDragStart,
  onDragEnd,
  onOpen,
}: {
  todo: BoardTodo;
  showClientTag: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onOpen: () => void;
}) {
  const clientTag =
    showClientTag && todo.client ? (
      <Link
        href={`/clients/${todo.client.id}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        draggable={false}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium hover:opacity-90 transition-opacity"
        style={(() => {
          const t = tintFor(todo.client.id);
          return { background: t.bg, color: t.fg };
        })()}
      >
        {todo.client.name}
      </Link>
    ) : null;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", todo.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={cn(
        "bg-white rounded-xl border border-hairline p-3 cursor-grab active:cursor-grabbing transition-all",
        "hover:border-[#D4D3CF] hover:shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_4px_12px_-6px_rgba(0,0,0,0.08)]",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[13px] leading-5 text-ink flex-1 min-w-0">
          {todo.title}
        </div>
        <AssigneeChip assignee={todo.assignee ?? null} />
      </div>

      {(clientTag || (todo.notes_count ?? 0) > 0) && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {clientTag}
          {(todo.notes_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
              <MessageSquareText className="h-3 w-3" strokeWidth={1.75} />
              {todo.notes_count}
            </span>
          )}
        </div>
      )}
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
      <div className="text-[10px] leading-tight mt-0.5">Drop to finish</div>
    </div>
  );
}

// Re-export the Assignee type for parent imports — no-op but satisfies readers.
export type { Assignee };
