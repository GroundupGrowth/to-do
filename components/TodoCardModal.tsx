"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ExternalLink, Trash2, X } from "lucide-react";
import {
  addTodoNote,
  assignTodo,
  completeTodo,
  deleteTodoNote,
  fetchTodoNotes,
  updateTodoTitle,
} from "@/lib/mutations";
import {
  ASSIGNEES,
  ASSIGNEE_META,
  type Assignee,
  type Todo,
  type TodoNote,
  type TodoWithClient,
} from "@/lib/types";
import { AssigneeChip } from "@/components/AssigneeChip";
import { Button } from "@/components/ui/Button";
import { cn, tintFor } from "@/lib/utils";

type CardTodo = (Todo | TodoWithClient) & { client?: { id: string; name: string } };

export function TodoCardModal({
  todo,
  open,
  onOpenChange,
  onLocalUpdate,
  onLocalNotesDelta,
  onLocalComplete,
}: {
  todo: CardTodo | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Optimistic update for the board's in-memory list. */
  onLocalUpdate: (patch: Partial<CardTodo>) => void;
  /** +1 when a note is added, -1 when a note is deleted. */
  onLocalNotesDelta: (delta: number) => void;
  /** Fired when the todo is soft-completed from inside the modal. */
  onLocalComplete: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/25 z-40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[min(560px,calc(100vw-32px))] max-h-[calc(100vh-48px)] overflow-hidden",
            "bg-white rounded-2xl border border-hairline shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]",
            "flex flex-col",
          )}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">To-do details</Dialog.Title>

          {todo ? (
            <ModalBody
              key={todo.id}
              todo={todo}
              onClose={() => onOpenChange(false)}
              onLocalUpdate={onLocalUpdate}
              onLocalNotesDelta={onLocalNotesDelta}
              onLocalComplete={onLocalComplete}
            />
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ModalBody({
  todo,
  onClose,
  onLocalUpdate,
  onLocalNotesDelta,
  onLocalComplete,
}: {
  todo: CardTodo;
  onClose: () => void;
  onLocalUpdate: (patch: Partial<CardTodo>) => void;
  onLocalNotesDelta: (delta: number) => void;
  onLocalComplete: () => void;
}) {
  const [notes, setNotes] = useState<TodoNote[] | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingNotes(true);
    fetchTodoNotes(todo.id).then((data) => {
      if (cancelled) return;
      setNotes(data);
      setLoadingNotes(false);
    });
    return () => {
      cancelled = true;
    };
  }, [todo.id]);

  return (
    <>
      <header className="flex items-start justify-between gap-3 px-6 pt-5 pb-3 border-b border-hairline">
        <div className="flex-1 min-w-0">
          <TitleEditor
            id={todo.id}
            initial={todo.title}
            onCommit={(t) => onLocalUpdate({ title: t })}
          />
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {todo.client && (
              <ClientBadge id={todo.client.id} name={todo.client.name} />
            )}
            <StatusBadge status={todo.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="h-8 w-8 shrink-0 grid place-items-center rounded-lg text-ink-muted hover:bg-[#F7F7F5] transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <section className="px-6 py-4 border-b border-hairline">
          <SectionLabel>Assigned to</SectionLabel>
          <div className="mt-2">
            <AssigneePicker
              id={todo.id}
              current={todo.assignee ?? null}
              onChange={(a) => onLocalUpdate({ assignee: a })}
            />
          </div>
        </section>

        <section className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>
              Notes {notes && notes.length > 0 && `(${notes.length})`}
            </SectionLabel>
          </div>

          {loadingNotes ? (
            <div className="text-[13px] text-ink-subtle py-4">Loading…</div>
          ) : notes && notes.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {notes.map((n) => (
                <NoteItem
                  key={n.id}
                  note={n}
                  onDelete={() => {
                    setNotes((prev) => prev?.filter((x) => x.id !== n.id) ?? null);
                    onLocalNotesDelta(-1);
                  }}
                />
              ))}
            </ul>
          ) : (
            <div className="text-[13px] text-ink-subtle py-1">
              No notes yet. Add the first one below.
            </div>
          )}

          <div className="mt-4">
            <AddNoteForm
              todoId={todo.id}
              onAdd={(n) => {
                setNotes((prev) => [...(prev ?? []), n]);
                onLocalNotesDelta(1);
              }}
            />
          </div>
        </section>
      </div>

      <footer className="px-6 py-3 border-t border-hairline flex items-center justify-between gap-3 bg-[#FAFAF8]">
        <div className="text-[11px] text-ink-subtle">
          Created {formatRelative(todo.created_at)}
        </div>
        <MarkDoneButton
          todoId={todo.id}
          onDone={() => {
            onLocalComplete();
            onClose();
          }}
        />
      </footer>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-ink-subtle font-medium">
      {children}
    </div>
  );
}

function TitleEditor({
  id,
  initial,
  onCommit,
}: {
  id: string;
  initial: string;
  onCommit: (t: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setValue(initial), [initial]);

  function commit() {
    const trimmed = value.trim();
    setEditing(false);
    if (!trimmed || trimmed === initial) {
      setValue(initial);
      return;
    }
    onCommit(trimmed);
    startTransition(async () => {
      try {
        await updateTodoTitle(id, trimmed);
      } catch {
        setValue(initial);
        onCommit(initial);
      }
    });
  }

  if (editing) {
    return (
      <textarea
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setValue(initial);
            setEditing(false);
          }
        }}
        rows={2}
        className="w-full text-[18px] font-semibold tracking-tight text-ink resize-none bg-transparent border-0 outline-none p-0 leading-tight"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-left w-full text-[18px] font-semibold tracking-tight text-ink leading-tight hover:text-ink/80 transition-colors"
    >
      {value}
    </button>
  );
}

function ClientBadge({ id, name }: { id: string; name: string }) {
  const t = tintFor(id);
  return (
    <Link
      href={`/clients/${id}`}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium hover:opacity-90 transition-opacity"
      style={{ background: t.bg, color: t.fg }}
    >
      {name}
      <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
    </Link>
  );
}

const STATUS_LABEL: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  questions: "Questions",
  postpone: "Postpone",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium bg-pill-neutral text-pill-neutralInk">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-muted" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function AssigneePicker({
  id,
  current,
  onChange,
}: {
  id: string;
  current: Assignee | null;
  onChange: (a: Assignee | null) => void;
}) {
  const [, startTransition] = useTransition();

  function handle(a: Assignee | null) {
    onChange(a);
    startTransition(async () => {
      try {
        await assignTodo(id, a);
      } catch {}
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {ASSIGNEES.map((a) => {
        const meta = ASSIGNEE_META[a];
        const active = current === a;
        return (
          <button
            key={a}
            type="button"
            onClick={() => handle(active ? null : a)}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-medium transition-all border",
              active
                ? "border-transparent shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                : "border-hairline bg-white hover:bg-[#F7F7F5]",
            )}
            style={
              active
                ? { background: meta.bg, color: meta.fg }
                : { color: "#5C5B57" }
            }
          >
            <span
              className="h-4 w-4 rounded-full grid place-items-center text-[9px] font-semibold"
              style={{ background: meta.bg, color: meta.fg }}
            >
              {meta.label[0]}
            </span>
            {meta.label}
            {active && <Check className="h-3 w-3" strokeWidth={2.5} />}
          </button>
        );
      })}
    </div>
  );
}

function NoteItem({
  note,
  onDelete,
}: {
  note: TodoNote;
  onDelete: () => void;
}) {
  const [, startTransition] = useTransition();
  const authorLabel = note.author ? ASSIGNEE_META[note.author].label : "Unsigned";

  function handleDelete() {
    onDelete();
    startTransition(async () => {
      try {
        await deleteTodoNote(note.id);
      } catch {}
    });
  }

  return (
    <li className="group flex gap-3 items-start">
      <AssigneeChip assignee={note.author} size="md" className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[12px] font-medium text-ink">{authorLabel}</span>
          <span className="text-[11px] text-ink-subtle">
            {formatRelative(note.created_at)}
          </span>
        </div>
        <p className="text-[13px] leading-5 text-ink whitespace-pre-wrap break-words">
          {note.body}
        </p>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete note"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-ink-subtle hover:text-accent"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </li>
  );
}

function AddNoteForm({
  todoId,
  onAdd,
}: {
  todoId: string;
  onAdd: (n: TodoNote) => void;
}) {
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState<Assignee | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        const saved = await addTodoNote({ todoId, author, body: trimmed });
        onAdd(saved as TodoNote);
        setBody("");
      } catch {}
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Add a note… ⌘↵ to post"
        rows={3}
        className="w-full p-3 bg-[#FAFAF8] rounded-xl border border-hairline text-[13px] leading-5 resize-y focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-accent/20 transition-colors"
      />
      <div className="flex items-center justify-between gap-2">
        <AuthorPicker value={author} onChange={setAuthor} />
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !body.trim()}
        >
          {isPending ? "Posting…" : "Post note"}
        </Button>
      </div>
    </form>
  );
}

function AuthorPicker({
  value,
  onChange,
}: {
  value: Assignee | null;
  onChange: (a: Assignee | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-ink-subtle">From</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "h-6 px-2 rounded-full text-[11px] font-medium transition-colors",
            value === null
              ? "bg-ink text-white"
              : "text-ink-muted hover:bg-[#F7F7F5]",
          )}
        >
          Unsigned
        </button>
        {ASSIGNEES.map((a) => {
          const meta = ASSIGNEE_META[a];
          const active = value === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => onChange(a)}
              className={cn(
                "h-6 w-6 rounded-full grid place-items-center text-[10px] font-semibold transition-all",
                active && "ring-2 ring-offset-1 ring-ink/40",
              )}
              style={{ background: meta.bg, color: meta.fg }}
              title={meta.label}
            >
              {meta.label[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MarkDoneButton({
  todoId,
  onDone,
}: {
  todoId: string;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  function handle() {
    onDone();
    startTransition(async () => {
      try {
        await completeTodo(todoId);
      } catch {}
    });
  }
  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      onClick={handle}
      disabled={isPending}
    >
      <Check className="h-4 w-4" strokeWidth={2} />
      Mark done
    </Button>
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
