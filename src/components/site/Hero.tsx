import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import { HERO_SLIDES } from "@/data/site";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);
  const slide = HERO_SLIDES[i];

  return (
    <section id="hero" className="relative h-screen min-h-[640px] w-full overflow-hidden bg-ink text-white">
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          <img src={slide.image} alt="" loading="eager" className="h-full w-full object-cover" />
          <div className="hero-overlay absolute inset-0" />
        </motion.div>
      </AnimatePresence>

      {/* floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, k) => (
          <motion.span
            key={k}
            className="absolute h-1.5 w-1.5 rounded-full bg-white/40"
            style={{ left: `${(k * 53) % 100}%`, top: `${(k * 37) % 100}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 4 + (k % 4), repeat: Infinity, delay: k * 0.15 }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {slide.kicker}
            </div>
            <h1 className="text-balance text-4xl font-black leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
              {slide.title}
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-base text-white/80 sm:text-lg md:text-xl">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <button
            onClick={() => scrollTo("services")}
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold shadow-brand transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            View Services
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => scrollTo("contact")}
            className="group inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:border-white hover:bg-white hover:text-ink"
          >
            <FiPlay className="h-4 w-4" />
            Contact Us
          </button>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {HERO_SLIDES.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Slide ${k + 1}`}
              className={`h-1.5 rounded-full transition-all ${k === i ? "w-10 bg-brand" : "w-4 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}