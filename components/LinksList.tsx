"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { createLink, deleteLink } from "@/lib/mutations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Link as LinkRecord } from "@/lib/types";

export function LinksList({
  clientId,
  links,
}: {
  clientId: string;
  links: LinkRecord[];
}) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !url.trim()) {
      setError("Label and URL are required.");
      return;
    }
    startTransition(async () => {
      try {
        await createLink({ clientId, label, url });
        setLabel("");
        setUrl("");
        setError(null);
        setAdding(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteLink(id, clientId);
      } catch {
        // Ignore; revalidation will bring back reality on next render.
      }
    });
  }

  return (
    <div>
      <ul className="flex flex-col">
        {links.length === 0 && !adding && (
          <li className="py-6 text-[13px] text-ink-subtle text-center">
            No links yet.
          </li>
        )}

        {links.map((l) => (
          <li
            key={l.id}
            className="group flex items-center gap-3 py-2.5 border-b border-hairline last:border-b-0"
          >
            <ExternalLink
              className="h-4 w-4 shrink-0 text-ink-subtle"
              strokeWidth={1.75}
            />
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0 text-[14px] hover:text-accent transition-colors"
            >
              <span className="font-medium">{l.label}</span>
              <span className="text-ink-subtle ml-2 truncate">
                {prettyUrl(l.url)}
              </span>
            </a>
            <button
              type="button"
              onClick={() => handleDelete(l.id)}
              aria-label="Delete link"
              className="opacity-0 group-hover:opacity-100 text-ink-subtle hover:text-accent transition-opacity p-1 rounded"
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <form onSubmit={handleAdd} className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder="Label (e.g. Figma)"
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
          {error && <div className="text-[12px] text-accent">{error}</div>}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Adding…" : "Add link"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setLabel("");
                setUrl("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink px-2 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors w-full"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          Add link
        </button>
      )}
    </div>
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
