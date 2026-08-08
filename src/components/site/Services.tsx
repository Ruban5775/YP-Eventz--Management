import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiBriefcase,
  FiCheck,
  FiCalendar,
  FiUsers,
  FiHeart,
  FiStar,
  FiCamera,
  FiMusic,
  FiGift,
  FiHome,
} from "react-icons/fi";

import { HiSparkles } from "react-icons/hi2";

import { SectionTitle } from "./Section";

const API_BASE = import.meta.env.VITE_API_BASE;

const ICONS: Record<string, React.ReactNode> = {
  briefcase: <FiBriefcase className="h-7 w-7" />,
  sparkles: <HiSparkles className="h-7 w-7" />,
  calendar: <FiCalendar className="h-7 w-7" />,
  users: <FiUsers className="h-7 w-7" />,
  heart: <FiHeart className="h-7 w-7" />,
  star: <FiStar className="h-7 w-7" />,
  camera: <FiCamera className="h-7 w-7" />,
  music: <FiMusic className="h-7 w-7" />,
  gift: <FiGift className="h-7 w-7" />,
  building: <FiHome className="h-7 w-7" />,
};

type Service = {

  id: number;

  icon: string;

  title: string;

  description: string;

  items: string[];

};

export function Services() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {

    loadServices();

  }, []);

  const loadServices = async () => {

    try {

      const response = await fetch(
        `${API_BASE}/admin/get_public_services.php`
      );

      const result = await response.json();

      if (result.success) {

        setServices(result.data);

      }

    } catch (error) {

      console.error(error);

    }

  };
  return (
    <section id="services" className="relative overflow-hidden bg-surface py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <SectionTitle
          center
          eyebrow="What we do"
          title={<>Two disciplines. <span className="text-brand">One relentless</span> standard.</>}
          subtitle="From boardroom to ballroom — we produce events that move brands and people forward."
        />
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {services.map((s, k) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: k * 0.15 }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-white p-8 shadow-soft transition-shadow hover:shadow-brand sm:p-10"
            >
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/5 transition-all group-hover:bg-brand/15" />
              <div className="relative">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-brand">
                  {ICONS[s.icon] ?? <FiBriefcase className="h-7 w-7" />}
                </div>
                <h3 className="text-2xl font-black text-ink sm:text-3xl">{s.title}</h3>
                <p className="mt-3 text-muted-foreground">{s.description}</p>
                <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-ink">
                      <FiCheck className="h-4 w-4 shrink-0 text-brand" />
                      {it}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white"
                >
                  Enquire Now <FiArrowUpRight />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}