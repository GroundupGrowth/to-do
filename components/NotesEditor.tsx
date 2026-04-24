"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pencil, Check } from "lucide-react";
import { updateClientNotes } from "@/lib/mutations";
import { cn } from "@/lib/utils";

export function NotesEditor({
  clientId,
  initialValue,
}: {
  clientId: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialValue);

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
      // Place cursor at the end on entry.
      const len = textareaRef.current?.value.length ?? 0;
      textareaRef.current?.setSelectionRange(len, len);
    }
  }, [editing]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  function scheduleSave(next: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (next === lastSavedRef.current) return;
      setSaved("saving");
      startTransition(async () => {
        try {
          await updateClientNotes(clientId, next);
          lastSavedRef.current = next;
          setSaved("saved");
          if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
          savedTimerRef.current = setTimeout(() => setSaved("idle"), 1200);
        } catch {
          setSaved("idle");
        }
      });
    }, 600);
  }

  function handleBlur() {
    setEditing(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value === lastSavedRef.current) return;
    setSaved("saving");
    startTransition(async () => {
      try {
        await updateClientNotes(clientId, value);
        lastSavedRef.current = value;
        setSaved("saved");
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved("idle"), 1200);
      } catch {
        setSaved("idle");
      }
    });
  }

  const empty = value.trim().length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[11px] text-ink-subtle">
          {saved === "saving" && <span>Saving…</span>}
          {saved === "saved" && (
            <span className="inline-flex items-center gap-1 text-pill-greenInk">
              <Check className="h-3 w-3" strokeWidth={2.5} /> Saved
            </span>
          )}
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[12px] text-ink-muted hover:text-ink transition-colors inline-flex items-center gap-1"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            scheduleSave(e.target.value);
          }}
          onBlur={handleBlur}
          placeholder="Write anything — markdown supported. Autosaves on blur."
          className={cn(
            "w-full min-h-[260px] p-4 bg-[#FAFAF8] rounded-xl border border-hairline",
            "text-[14px] leading-6 font-mono-0 resize-y",
            "focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-accent/20",
          )}
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setEditing(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setEditing(true);
            }
          }}
          className={cn(
            "min-h-[160px] p-4 rounded-xl border border-hairline bg-[#FAFAF8] cursor-text",
            "prose-notes text-[14px] leading-6",
            empty && "text-ink-subtle",
          )}
        >
          {empty ? (
            "Click to add notes. Markdown is supported."
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          )}
        </div>
      )}
    </div>
  );
}
