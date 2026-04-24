import { X } from "lucide-react";
import { tintFor } from "@/lib/utils";

export function TagPill({
  tag,
  onRemove,
  size = "sm",
}: {
  tag: string;
  onRemove?: () => void;
  size?: "xs" | "sm";
}) {
  const t = tintFor(tag.toLowerCase());
  const sizing =
    size === "xs"
      ? "h-5 px-1.5 text-[10px]"
      : "h-6 px-2 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizing}`}
      style={{ background: t.bg, color: t.fg }}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${tag}`}
          className="ml-0.5 -mr-0.5 hover:opacity-70 transition-opacity"
        >
          <X className="h-3 w-3" strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
