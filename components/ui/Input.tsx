import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full px-3 bg-white rounded-xl border border-hairline text-[14px] placeholder:text-ink-subtle",
        "focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-accent/20 transition-colors",
        className,
      )}
      {...props}
    />
  );
});
