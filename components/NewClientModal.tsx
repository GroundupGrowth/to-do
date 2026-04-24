"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TagPill } from "@/components/TagPill";
import { createClientRecord } from "@/lib/mutations";

export function NewClientModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setDescription("");
    setTags([]);
    setTagInput("");
    setError(null);
  }

  function commitTagInput() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const exists = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (!exists) setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    // Catch a half-typed tag still in the input.
    const finalTags = tagInput.trim()
      ? [...tags, tagInput.trim()]
      : tags;
    startTransition(async () => {
      try {
        await createClientRecord({ name, description, tags: finalTags });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        if (msg.includes("NEXT_REDIRECT")) {
          reset();
          setOpen(false);
          return;
        }
        setError(msg);
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" strokeWidth={2} />
        New Client
      </Button>

      <Modal
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title="New client"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-ink-muted">
              Name
            </label>
            <Input
              autoFocus
              placeholder="e.g. Ridgeline Coffee"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-ink-muted">
              Description <span className="text-ink-subtle">(optional)</span>
            </label>
            <Input
              placeholder="One-line summary of the work"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-ink-muted">
              Tags <span className="text-ink-subtle">(optional)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-xl border border-hairline">
              {tags.map((t) => (
                <TagPill
                  key={t}
                  tag={t}
                  onRemove={() =>
                    setTags((prev) => prev.filter((x) => x !== t))
                  }
                />
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTagInput();
                  } else if (
                    e.key === "Backspace" &&
                    !tagInput &&
                    tags.length > 0
                  ) {
                    setTags((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={commitTagInput}
                placeholder={
                  tags.length === 0 ? "active, retainer, design…" : ""
                }
                className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] placeholder:text-ink-subtle px-1"
              />
            </div>
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
