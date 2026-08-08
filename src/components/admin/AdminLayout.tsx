import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import {
  FiEdit3, FiFileText, FiGrid, FiHelpCircle,
  FiImage, FiLogOut, FiMenu, FiMessageSquare, FiSettings, FiUsers, FiX,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/SettingsProvider";

const MENU = [
  { to: "/ypeventz/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/ypeventz/leads", label: "Leads", icon: FiUsers },
  // { to: "/ypeventz/content", label: "Website Content", icon: FiFileText },
  { to: "/ypeventz/services", label: "Services", icon: FiEdit3 },
  { to: "/ypeventz/work", label: "Our Work", icon: FiImage },
  { to: "/ypeventz/testimonials", label: "Testimonials", icon: FiMessageSquare },
  // { to: "/ypeventz/faq", label: "FAQ", icon: FiHelpCircle },
  { to: "/ypeventz/settings", label: "Website Settings", icon: FiSettings },
] as const;

function useAdminGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("yp_admin") !== "1") navigate("/ypeventz");
  }, [navigate]);
}

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  useAdminGuard();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const { settings, loading } = useSettings();

  const logout = () => {
    localStorage.removeItem("yp_admin");
    navigate("/ypeventz");
  };

  const API_BASE = import.meta.env.VITE_API_BASE;

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink/10 bg-panel text-panel-foreground lg:flex">
        <div className="flex items-center gap-2 border-b border-ink/10 px-6 py-5">
         <img src={`${API_BASE}/uploads/${settings?.logo ?? ""}`} alt={settings?.company_name ?? ""} className="h-10 w-auto" />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {MENU.map((m) => {
            const active = pathname === m.to;
            return (
              <Link
                key={m.to}
                to={m.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-brand text-white shadow-brand"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink",
                )}
              >
                <m.icon className="h-4 w-4" /> {m.label}
              </Link>
            );
          })}
        </nav>
       <button onClick={logout} className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm text-ink/70 transition hover:border-brand hover:bg-brand hover:text-white">
          <FiLogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-panel text-panel-foreground lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
                <img src={`${API_BASE}/uploads/${settings?.logo ?? ""}`} alt={settings?.company_name ?? ""} className="h-10 w-auto" />
                <button onClick={() => setOpen(false)} className="text-ink"><FiX /></button>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {MENU.map((m) => (
                  <Link key={m.to} to={m.to} onClick={() => setOpen(false)}
                    className={cn("flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                     pathname === m.to ? "bg-brand text-white" : "text-ink/70 hover:bg-ink/5 hover:text-ink")}>
                    <m.icon className="h-4 w-4" /> {m.label}
                  </Link>
                ))}
              </nav>
              <button onClick={logout} className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm text-ink/70">
                <FiLogOut className="h-4 w-4" /> Logout
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-lg border border-border p-2 lg:hidden"><FiMenu /></button>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</div>
              <div className="text-lg font-bold text-ink">{title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link target="_blank" to="/" className="hidden text-sm font-semibold text-ink hover:text-brand sm:inline">View site ↗</Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">YP</div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
