"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { TagPill } from "@/components/TagPill";
import { setClientTags } from "@/lib/mutations";
import { cn } from "@/lib/utils";

export function ClientTagsEditor({
  clientId,
  initial,
}: {
  clientId: string;
  initial: string[];
}) {
  const [tags, setTags] = useState<string[]>(initial);
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");
  const [, startTransition] = useTransition();

  function commit(next: string[]) {
    setTags(next);
    startTransition(async () => {
      try {
        await setClientTags(clientId, next);
      } catch {
        setTags(initial);
      }
    });
  }

  function add() {
    const trimmed = input.trim();
    if (!trimmed) {
      setAdding(false);
      setInput("");
      return;
    }
    const exists = tags.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!exists) {
      commit([...tags, trimmed]);
    }
    setInput("");
  }

  function remove(tag: string) {
    commit(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t) => (
        <TagPill key={t} tag={t} onRemove={() => remove(t)} />
      ))}

      {adding ? (
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
            if (e.key === "Escape") {
              setAdding(false);
              setInput("");
            }
            if (e.key === "Backspace" && !input && tags.length > 0) {
              remove(tags[tags.length - 1]);
            }
          }}
          onBlur={() => {
            add();
            setAdding(false);
          }}
          placeholder="tag name"
          className="h-6 px-2 bg-white rounded-full border border-hairline text-[11px] outline-none focus:border-ink/30 focus:ring-2 focus:ring-accent/20 w-[100px]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={cn(
            "inline-flex items-center gap-1 h-6 px-2 rounded-full border border-dashed border-[#D4D3CF]",
            "text-[11px] font-medium text-ink-muted hover:text-ink hover:bg-white transition-colors",
          )}
        >
          <Plus className="h-3 w-3" strokeWidth={2} />
          {tags.length === 0 ? "Add tag" : "Add"}
        </button>
      )}
    </div>
  );
}
