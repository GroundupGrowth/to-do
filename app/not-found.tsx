import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="text-center">
        <div className="text-[12px] text-ink-subtle tracking-wider uppercase mb-2">
          404
        </div>
        <h1 className="text-display mb-3">Not found</h1>
        <p className="text-[14px] text-ink-muted mb-6">
          That page doesn't exist.
        </p>
        <Link
          href="/"
          className="text-[13px] text-accent hover:underline underline-offset-2"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
