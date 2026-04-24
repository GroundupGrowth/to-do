import { cn } from "@/lib/utils";

type Tone = "pink" | "green" | "neutral";

const toneClass: Record<Tone, string> = {
  pink: "bg-pill-pink text-pill-pinkInk",
  green: "bg-pill-green text-pill-greenInk",
  neutral: "bg-pill-neutral text-pill-neutralInk",
};

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 h-5 rounded-full text-[11px] font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
