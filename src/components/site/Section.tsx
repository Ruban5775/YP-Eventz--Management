import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function SectionTitle({ eyebrow, title, subtitle, center = false }: { eyebrow?: string; title: ReactNode; subtitle?: string; center?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      {eyebrow && (
        <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand">
          <span className="h-[2px] w-6 bg-brand" /> {eyebrow}
        </div>
      )}
      <h2 className="text-balance text-3xl font-black text-ink sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base text-muted-foreground sm:text-lg">{subtitle}</p>}
    </motion.div>
  );
}