import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { FAQS } from "@/data/site";
import { SectionTitle } from "./Section";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        <SectionTitle
          center
          eyebrow="FAQ"
          title={<>Questions? <span className="text-brand">Answered.</span></>}
        />
        <div className="mt-12 space-y-3">
          {FAQS.map((f, k) => {
            const isOpen = open === k;
            return (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: k * 0.05 }}
                className="overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : k)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-base font-bold text-ink sm:text-lg">{f.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isOpen ? "bg-brand text-white" : "bg-white text-ink"} transition-colors`}
                  >
                    <FiPlus />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-muted-foreground">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}