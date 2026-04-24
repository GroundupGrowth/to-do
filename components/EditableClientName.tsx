"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { updateClientName } from "@/lib/mutations";

export function EditableClientName({
  id,
  initialName,
}: {
  id: string;
  initialName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialName);
  const [isPending, startTransition] = useTransition();

  function commit() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialName) {
      setEditing(false);
      setValue(initialName);
      return;
    }
    startTransition(async () => {
      try {
        await updateClientName(id, trimmed);
        setEditing(false);
      } catch {
        setValue(initialName);
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setEditing(false);
              setValue(initialName);
            }
          }}
          className="text-display bg-transparent border-b border-hairline focus:border-ink outline-none min-w-[200px]"
        />
        <button
          type="button"
          onClick={commit}
          disabled={isPending}
          className="h-8 w-8 grid place-items-center rounded-full hover:bg-[#F7F7F5] text-ink-muted"
          aria-label="Save"
        >
          <Check className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setValue(initialName);
          }}
          className="h-8 w-8 grid place-items-center rounded-full hover:bg-[#F7F7F5] text-ink-muted"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 group">
      <h1 className="text-display">{initialName}</h1>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="h-8 w-8 grid place-items-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F7F7F5] text-ink-muted"
        aria-label="Rename"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
