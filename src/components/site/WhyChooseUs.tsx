import { motion } from "framer-motion";
import { FiAward, FiClock, FiSettings, FiUsers, FiCreditCard } from "react-icons/fi";
import { HiLightBulb } from "react-icons/hi2";
import { WHY_US } from "@/data/site";

const ICONS: Record<string, React.ReactNode> = {
  users: <FiUsers />, lightbulb: <HiLightBulb />, settings: <FiSettings />,
  wallet: <FiCreditCard />, clock: <FiClock />, award: <FiAward />,
};
 
export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-panel py-24 text-panel-foreground sm:py-32">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgb(227 30 36 / 0.9), transparent 50%), radial-gradient(circle at 80% 80%, rgb(227 30 36 / 0.6), transparent 50%)" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand">
              <span className="h-[2px] w-6 bg-brand" /> Why choose us
            </div>
          <h2 className="text-balance text-3xl font-black text-ink sm:text-4xl md:text-5xl">
              Six reasons India's <span className="text-brand">boldest brands</span> trust us.
            </h2>
          </div>
           <p className="text-panel-muted lg:pl-10">
            You get the pitch of an agency, the discipline of a production house, and the attention of a boutique studio — all in one team.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map((w, k) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: k * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-7 shadow-soft transition-all hover:border-brand/60"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-xl text-white shadow-brand transition-transform group-hover:scale-110">
                {ICONS[w.icon]}
              </div>
              <h3 className="text-lg font-bold text-ink">{w.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}