import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/SettingsProvider";

const API_BASE = import.meta.env.VITE_API_BASE;

const LINKS = [
  { label: "Home", to: "hero" },
  { label: "About", to: "about" },
  { label: "Services", to: "services" }, 
  { label: "Our Work", to: "work" },
  { label: "Testimonials", to: "testimonials" },
  { label: "Contact", to: "contact" },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { settings, loading } = useSettings();
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.to)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/95 shadow-[0_6px_24px_-16px_rgb(0_0_0_/_0.2)] backdrop-blur"
      >
        <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <button
            onClick={() => scrollTo("hero")}
            className="flex shrink-0 items-center gap-1"
          >
            <img
              src={`${API_BASE}/uploads/${settings?.logo ?? ""}`}
              alt={settings?.company_name}
              className="h-18 w-auto object-contain sm:h-11 lg:h-20"
            />

            {/* <span className="whitespace-nowrap font-display text-sm font-extrabold uppercase tracking-tight text-ink sm:text-base">
              Eventz <span className="text-brand">Management</span>
            </span>  */}
          </button>

          <nav className="hidden items-center gap-6 xl:gap-8 lg:flex">
            {LINKS.map((l) => (
              <button
                key={l.to}
                onClick={() => scrollTo(l.to)}
                className={cn(
                  "group relative text-sm font-semibold uppercase tracking-wide transition-colors",
                  active === l.to ? "text-brand" : "text-ink hover:text-brand",
                )}
              >
                {l.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-[2px] bg-brand transition-all duration-300",
                    active === l.to ? "w-full" : "w-0 group-hover:w-full",
                  )}
                />
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            {/* <div className="flex items-center gap-2">
              {[
                { href: settings?.instagram, label: "Instagram", Icon: FaInstagram },
                { href: settings?.youtube, label: "YouTube", Icon: FaYoutube },
                { href: settings?.facebook, label: "Facebook", Icon: FaFacebookF },
                { href: settings?.linkedin, label: "LinkedIn", Icon: FaLinkedinIn },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div> */}
            <div className="hidden shrink-0 items-center lg:flex">
              <button
                onClick={() => scrollTo("contact")}
                className="whitespace-nowrap rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                Book Now
              </button>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-ink/20 text-ink lg:hidden"
            aria-label="Menu"
          >
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-3 bg-current" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-panel text-panel-foreground text-black lg:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="flex h-[76px] items-center justify-between px-6">
              <button
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => scrollTo("hero"), 300);
                }}
                className="flex min-w-0 items-center gap-3"
              >
                <img
                  src={`${API_BASE}/uploads/${settings?.logo ?? ""}`}
                  alt={settings?.company_name}
                  className="h-15 w-auto shrink-0 object-contain sm:h-10"
                />

                {/* <span className="whitespace-nowrap font-display text-sm font-extrabold uppercase tracking-tight text-ink sm:text-base">
                  Eventz <span className="text-brand">Management</span>
                </span> */}
              </button>

              <button
                onClick={() => setOpen(false)}
                className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/30"
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            <nav className="mt-16 flex flex-col items-center gap-8">
              {LINKS.map((l, i) => (
                <motion.button
                  key={l.to}
                  onClick={() => { setOpen(false); setTimeout(() => scrollTo(l.to), 300); }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="font-display text-3xl font-bold hover:text-brand"
                >
                  {l.label}
                </motion.button>
              ))}
              <button
                onClick={() => { setOpen(false); setTimeout(() => scrollTo("contact"), 300); }}
                className="mt-4 rounded-full bg-brand px-8 py-3 font-semibold shadow-brand"
              >
                Book Now
              </button>
            </nav>
            <div className="mt-auto flex justify-center gap-6 py-8 text-lg">
              <a href={settings?.facebook} aria-label="Facebook" target="_blank" className="hover:text-brand transition"><FaFacebookF /></a>
              <a href={settings?.instagram} aria-label="Instagram" target="_blank" className="hover:text-brand transition"><FaInstagram /></a>
              <a href={settings?.youtube} aria-label="YouTube" target="_blank" className="hover:text-brand transition"><FaYoutube /></a>
              <a href={settings?.linkedin} aria-label="LinkedIn" target="_blank" className="hover:text-brand transition"><FaLinkedinIn /></a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}