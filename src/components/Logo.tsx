import { cn } from "@/lib/utils";

/** Original PixelNest mark: a soft frame cradling a pixel inside a nest curve, with a creative spark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="9" className="fill-primary" />
      <path d="M7.5 16.5a8.5 8.5 0 0 0 17 0" fill="none" className="stroke-primary-foreground" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="11" y="13.2" width="5.4" height="5.4" rx="1.2" className="fill-primary-foreground" />
      <rect x="17.4" y="10.6" width="3.4" height="3.4" rx="0.8" className="fill-primary-foreground" opacity="0.65" />
      <path d="M23.6 4.8l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {!compact && <span className="font-display text-[1.15rem] font-semibold tracking-tight">PixelNest</span>}
    </span>
  );
}
