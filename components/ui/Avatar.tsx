import { initialsFor, tintFor } from "@/lib/utils";

export function Avatar({
  id,
  name,
  size = 28,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const { bg, fg } = tintFor(id);
  const initials = initialsFor(name);
  return (
    <div
      className="rounded-full grid place-items-center font-semibold select-none"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.max(10, Math.floor(size * 0.42)),
        letterSpacing: "-0.01em",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
