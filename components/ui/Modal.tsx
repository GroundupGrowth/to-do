"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 bg-black/20 z-40",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[min(440px,calc(100vw-32px))] bg-white rounded-2xl border border-hairline",
            "shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] p-6",
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-[17px] font-semibold tracking-tight">
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="h-8 w-8 grid place-items-center rounded-lg text-ink-muted hover:bg-[#F7F7F5] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
