"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { deleteClient } from "@/lib/mutations";

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteClient(clientId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        // Server action redirect throws NEXT_REDIRECT — that's success.
        if (msg.includes("NEXT_REDIRECT")) return;
        setError(msg);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Delete client"
        className="h-8 w-8 grid place-items-center rounded-full text-ink-subtle hover:text-accent hover:bg-[#F7F7F5] transition-colors"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>

      <Modal
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setError(null);
        }}
        title={`Delete ${clientName}?`}
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] leading-6 text-ink-muted">
            This permanently removes the client and every to-do, note, and link
            attached to it. This can't be undone.
          </p>

          {error && <div className="text-[13px] text-accent">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-accent text-white hover:bg-[#E54577]"
            >
              {isPending ? "Deleting…" : "Delete client"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
