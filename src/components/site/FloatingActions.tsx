import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import { useSettings } from "@/context/SettingsProvider";

export function FloatingActions() {
  const [show, setShow] = useState(false); 
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });
  const { settings, loading } = useSettings();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.div
        style={{ scaleX: progress }}
        className="fixed left-0 right-0 top-0 z-[70] h-[3px] origin-left bg-brand"
      />
      <div className="fixed bottom-6 right-6 z-[65] flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
        <AnimatePresence>
          {show && (
            <motion.button
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Scroll to top"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-soft transition-transform hover:scale-110"
            >
              <FiArrowUp />
            </motion.button>
          )}
        </AnimatePresence>
        <a
          href={`https://wa.me/${settings?.whatsapp}?text=Hi%20Yours%20Perfect%20Eventz`}
          target="_blank" rel="noreferrer"
          aria-label="WhatsApp"
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgb(37_211_102_/_0.6)] transition-transform hover:scale-110"
        >
          <FaWhatsapp className="h-7 w-7" />
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/20" />
        </a>
      </div>
    </>
  );
}