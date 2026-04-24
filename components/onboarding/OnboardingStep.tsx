"use client";

import { useState, useTransition } from "react";
import {
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PromptRow } from "@/components/onboarding/PromptRow";
import {
  addOnboardingLink,
  addOnboardingPrompt,
  deleteOnboardingLink,
  deleteOnboardingStep,
  updateOnboardingStep,
} from "@/lib/mutations";
import type { OnboardingStepWithChildren } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OnboardingStep({
  index,
  step,
}: {
  index: number;
  step: OnboardingStepWithChildren;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description ?? "");
  const [addingPrompt, setAddingPrompt] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [, startTransition] = useTransition();

  function saveHeader() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitle(step.title);
      setEditing(false);
      return;
    }
    setEditing(false);
    startTransition(async () => {
      try {
        await updateOnboardingStep(step.id, {
          title: trimmedTitle,
          description: description.trim() || null,
        });
      } catch {}
    });
  }

  function handleDeleteStep() {
    if (
      !confirm(
        `Delete "${step.title}" and all of its prompts and links?`,
      )
    )
      return;
    startTransition(async () => {
      try {
        await deleteOnboardingStep(step.id);
      } catch {}
    });
  }

  return (
    <section className="relative bg-card rounded-2xl border border-hairline p-6">
      <header className="flex items-start gap-4">
        <div
          className="shrink-0 h-9 w-9 rounded-full bg-accent-soft text-pill-pinkInk grid place-items-center text-[14px] font-semibold tabular-nums"
          aria-hidden
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col gap-2">
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveHeader();
                  if (e.key === "Escape") {
                    setTitle(step.title);
                    setDescription(step.description ?? "");
                    setEditing(false);
                  }
                }}
                placeholder="Step title"
              />
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={saveHeader}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTitle(step.title);
                    setDescription(step.description ?? "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-semibold tracking-tight text-ink">
                  {step.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="h-7 w-7 grid place-items-center rounded-full text-ink-subtle hover:bg-[#F7F7F5] transition-colors"
                  aria-label="Edit step"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
              {step.description && (
                <p className="mt-1 text-[13px] text-ink-muted leading-5 max-w-2xl">
                  {step.description}
                </p>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleDeleteStep}
          aria-label="Delete step"
          className="shrink-0 h-8 w-8 grid place-items-center rounded-full text-ink-subtle hover:text-accent hover:bg-[#F7F7F5] transition-colors"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div>
          <SectionLabel>Prompts</SectionLabel>
          <div className="flex flex-col gap-2 mt-2">
            {step.prompts.length === 0 && !addingPrompt && (
              <div className="text-[12px] text-ink-subtle py-2">
                No prompts yet.
              </div>
            )}
            {step.prompts.map((p) => (
              <PromptRow key={p.id} prompt={p} />
            ))}
            {addingPrompt ? (
              <AddPromptForm
                stepId={step.id}
                onDone={() => setAddingPrompt(false)}
              />
            ) : (
              <AddRowButton onClick={() => setAddingPrompt(true)}>
                Add prompt
              </AddRowButton>
            )}
          </div>
        </div>

        <div>
          <SectionLabel>Links</SectionLabel>
          <div className="flex flex-col gap-1 mt-2">
            {step.links.length === 0 && !addingLink && (
              <div className="text-[12px] text-ink-subtle py-2">
                No links yet.
              </div>
            )}
            {step.links.map((l) => (
              <LinkRow key={l.id} id={l.id} label={l.label} url={l.url} />
            ))}
            {addingLink ? (
              <AddLinkForm
                stepId={step.id}
                onDone={() => setAddingLink(false)}
              />
            ) : (
              <AddRowButton onClick={() => setAddingLink(true)}>
                Add link
              </AddRowButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-ink-subtle font-medium">
      {children}
    </div>
  );
}

function AddRowButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mt-1 flex items-center gap-2 text-[12px] text-ink-muted hover:text-ink",
        "px-2 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors w-fit",
      )}
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
      {children}
    </button>
  );
}

function LinkRow({
  id,
  label,
  url,
}: {
  id: string;
  label: string;
  url: string;
}) {
  const [, startTransition] = useTransition();
  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteOnboardingLink(id);
      } catch {}
    });
  }
  return (
    <div className="group flex items-center gap-2 py-1.5 border-b border-hairline last:border-b-0">
      <ExternalLink
        className="h-3.5 w-3.5 shrink-0 text-ink-subtle"
        strokeWidth={1.75}
      />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 text-[13px] hover:text-accent transition-colors"
      >
        <span className="font-medium">{label}</span>
        <span className="text-ink-subtle ml-2 truncate">{prettyUrl(url)}</span>
      </a>
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete link"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-ink-subtle hover:text-accent"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

function AddPromptForm({
  stepId,
  onDone,
}: {
  stepId: string;
  onDone: () => void;
}) {
  const [label, setLabel] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !body.trim()) return;
    startTransition(async () => {
      try {
        await addOnboardingPrompt({ stepId, label, body });
        onDone();
      } catch {}
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 mt-1">
      <Input
        placeholder="Label (e.g. Welcome email)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        autoFocus
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Prompt text — this is what gets copied."
        rows={4}
        className="w-full p-3 bg-[#FAFAF8] rounded-xl border border-hairline text-[13px] leading-5 resize-y font-mono focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-accent/20 transition-colors"
      />
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !label.trim() || !body.trim()}
        >
          {isPending ? "Saving…" : "Save prompt"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddLinkForm({
  stepId,
  onDone,
}: {
  stepId: string;
  onDone: () => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;
    startTransition(async () => {
      try {
        await addOnboardingLink({ stepId, label, url });
        onDone();
      } catch {}
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 mt-1">
      <div className="flex gap-2">
        <Input
          autoFocus
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-[2]"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !label.trim() || !url.trim()}
        >
          {isPending ? "Saving…" : "Save link"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function prettyUrl(url: string) {
  try {
    const u = new URL(url);
    return u.host + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return url;
  }
}
