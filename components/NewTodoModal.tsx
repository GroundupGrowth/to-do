"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createTodo } from "@/lib/mutations";
import type { Client } from "@/lib/types";

export function NewTodoModal({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setClientId(clients[0]?.id ?? "");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !clientId) {
      setError("Title and client are required.");
      return;
    }
    startTransition(async () => {
      try {
        await createTodo({ title, clientId });
        reset();
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={clients.length === 0}
        className="gap-1.5"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        New To-Do
      </Button>

      <Modal
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title="New to-do"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-ink-muted">
              Title
            </label>
            <Input
              autoFocus
              placeholder="e.g. Review homepage copy v2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

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

          {error && <div className="text-[13px] text-accent">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
