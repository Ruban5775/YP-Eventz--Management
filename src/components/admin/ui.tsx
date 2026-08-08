import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-white p-5 shadow-soft sm:p-6", className)}>{children}</div>;
}

export function PageActions({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-3">{children}</div>;
}

export function Btn({ children, variant = "solid", className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" | "ghost" | "danger" }) {
  const styles = {
    solid: "bg-brand text-white shadow-brand hover:brightness-110",
    outline: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
    ghost: "text-ink hover:bg-surface",
    danger: "border border-brand text-brand hover:bg-brand hover:text-white",
  }[variant];
  return (
    <button {...rest} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all", styles, className)}>
      {children}
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls = "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export function StatusPill({ status }: { status: "Active" | "Inactive" | "New" | "Contacted" | "Won" | "Lost" }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Inactive: "bg-neutral-200 text-neutral-700",
    New: "bg-brand/10 text-brand",
    Contacted: "bg-amber-100 text-amber-700",
    Won: "bg-emerald-100 text-emerald-700",
    Lost: "bg-red-100 text-red-700",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", map[status])}>{status}</span>;
}

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-surface">✕</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border bg-surface px-6 py-3">{footer}</div>}
      </div>
    </div>
  );
}