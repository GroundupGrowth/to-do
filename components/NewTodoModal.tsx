"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createTodo } from "@/lib/mutations";
import { TODO_STAGES, type Client, type TodoStatus } from "@/lib/types";

const STATUS_LABEL: Record<TodoStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  questions: "Questions",
  postpone: "Postpone",
};

export function NewTodoModal({
  clients,
  open,
  onOpenChange,
  defaultClientId,
  defaultStatus = "todo",
}: {
  clients: Client[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultClientId?: string;
  defaultStatus?: TodoStatus;
}) {
  const initialClient = defaultClientId ?? clients[0]?.id ?? "";
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>(initialClient);
  const [status, setStatus] = useState<TodoStatus>(defaultStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset form whenever the modal opens with new defaults.
  useEffect(() => {
    if (open) {
      setTitle("");
      setClientId(defaultClientId ?? clients[0]?.id ?? "");
      setStatus(defaultStatus);
      setError(null);
    }
  }, [open, defaultClientId, defaultStatus, clients]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !clientId) {
      setError("Title and client are required.");
      return;
    }
    startTransition(async () => {
      try {
        await createTodo({ title, clientId, status });
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New to-do">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-ink-muted">Title</label>
          <Input
            autoFocus
            placeholder="e.g. Review homepage copy v2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-ink-muted">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="h-10 w-full px-3 bg-white rounded-xl border border-hairline text-[14px] focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-accent/20 transition-colors"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-ink-muted">
              Column
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TodoStatus)}
              className="h-10 w-full px-3 bg-white rounded-xl border border-hairline text-[14px] focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-accent/20 transition-colors"
            >
              {TODO_STAGES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="text-[13px] text-accent">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating…" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function NewTodoButton({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={clients.length === 0}>
        <Plus className="h-4 w-4" strokeWidth={2} />
        New To-Do
      </Button>
      <NewTodoModal clients={clients} open={open} onOpenChange={setOpen} />
    </>
  );
}
