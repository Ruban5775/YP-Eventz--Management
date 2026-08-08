import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";


export function PageLoader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("yp_loaded");
  });

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    const done = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("yp_loaded", "1");
    }, 3200);
    return () => {
      clearTimeout(done);
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* soft ambient wash */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/5 blur-[120px]"
            animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-8 text-center">
            {/* logo reveal: blurred + small -> sharp */}
            <motion.div
              className="relative w-[62vw] max-w-[380px] sm:w-[46vw]"
              initial={{ opacity: 0, scale: 0.86, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src="YP-Logo.png"
                alt="Yours Perfect Event Management"
                className="h-auto w-full select-none object-contain"
              />
              {/* shine sweep */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                initial={{ x: "-140%" }}
                animate={{ x: "340%" }}
                transition={{ duration: 1.2, delay: 0.9, ease: "easeInOut" }}
              />
            </motion.div>

            {/* divider line grows */}
            <motion.span
              aria-hidden
              className="mt-6 block h-[2px] bg-brand"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "58%", opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* tagline */}
            <div className="mt-4 overflow-hidden">
              <motion.p
                initial={{ y: "120%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-sm font-extrabold uppercase tracking-[0.28em] text-ink sm:text-base"
              >
                Made With <span className="text-brand">Perfection</span>
              </motion.p>
            </div>

            {/* thin progress */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.4 }}
              className="mt-10 h-[2px] w-40 overflow-hidden rounded-full bg-ink/10"
            >
              <motion.div
                className="h-full w-1/3 rounded-full bg-brand"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
