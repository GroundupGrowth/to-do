import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "bg-card rounded-2xl border border-hairline",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle && (
          <div className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</div>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("px-6 pb-6", className)}>{children}</div>;
}
