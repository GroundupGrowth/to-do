import { ASSIGNEE_META, type Assignee } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AssigneeChip({
  assignee,
  size = "sm",
  className,
}: {
  assignee: Assignee | null;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!assignee) {
    return (
      <div
        className={cn(
          "rounded-full border border-dashed border-[#D4D3CF] grid place-items-center text-ink-subtle",
          size === "sm" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]",
          className,
        )}
        aria-label="Unassigned"
      >
        ?
      </div>
    );
  }
  const meta = ASSIGNEE_META[assignee];
  const initial = meta.label[0];
  return (
    <div
      title={meta.label}
      aria-label={meta.label}
      className={cn(
        "rounded-full grid place-items-center font-semibold select-none",
        size === "sm" ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-[11px]",
        className,
      )}
      style={{ background: meta.bg, color: meta.fg }}
    >
      {initial}
    </div>
  );
}
