import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { useSettings } from "@/context/SettingsProvider";
import { useEffect, useState } from "react";
import {
  loadEventServices,
  EventService,
} from "@/data/site"; 
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE;

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function Footer() {
  const { settings, loading } = useSettings();

  const socialLinks = [
    {
      key: "facebook",
      url: settings?.facebook,
      icon: FaFacebookF,
    },
    {
      key: "instagram",
      url: settings?.instagram,
      icon: FaInstagram,
    },
    {
      key: "youtube",
      url: settings?.youtube,
      icon: FaYoutube,
    },
    {
      key: "linkedin",
      url: settings?.linkedin,
      icon: FaLinkedinIn,
    },
  ];

  const [services, setServices] = useState<EventService[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await loadEventServices();
        setServices(data);
      } catch (error) {
        console.error("Unable to load footer services:", error);
      }
    };

    fetchServices();
  }, []);

  return (
    <footer className="relative overflow-hidden bg-panel text-panel-foreground">

      {/* Subtle background decorations */}
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute
          -left-24
          top-10
          h-64
          w-64
          rounded-full
          bg-brand/[0.03]
          blur-3xl
        "
      />

      <div
        aria-hidden
        className="
          pointer-events-none
          absolute
          -right-24
          bottom-0
          h-72
          w-72
          rounded-full
          bg-brand/[0.04]
          blur-3xl
        "
      />

      {/* Main Footer */}
      <div
        className="
          relative
          z-10
          mx-auto
          grid
          max-w-7xl
          grid-cols-1
          gap-10
          px-5
          py-14

          sm:grid-cols-2
          sm:gap-x-12
          sm:gap-y-12
          sm:px-8
          sm:py-16

          lg:grid-cols-[1.15fr_0.85fr_0.95fr_1.15fr]
          lg:gap-0
          lg:px-10
          lg:py-16
        "
      >

        {/* =========================
            BRAND SECTION
        ========================= */}
        <div
          className="
            flex
            flex-col
            items-center
            text-center
            sm:items-start
            sm:text-left
            lg:pr-10
          "
        >

          {/* Logo + Brand Name */}
          <div className="flex w-fit flex-col items-center self-center">

            {!loading && settings?.logo && (
              <img
                src={`${API_BASE}/uploads/${settings.logo}`}
                alt={settings?.company_name || "Company Logo"}
                className="
                  h-20
                  w-auto
                  object-contain
                  sm:h-15
                  lg:h-25
                "
              />
            )}

            {/* <span
              className="
                mt-2
                whitespace-nowrap
                font-display
                text-sm
                font-extrabold
                uppercase
                tracking-tight
                text-ink
                sm:text-base
              "
            >
              Eventz{" "}
              <span className="text-brand">
                Management
              </span>
            </span> */}

          </div>

          {/* Description */}
          <p
            className="
              
              max-w-[300px]
              text-sm
              leading-6
              text-panel-muted
            "
          >
            Premium Event Management Company in Salem, Tamil Nadu —
            Corporate, Entertainment and More.
          </p>

          {/* Social Icons */}
          <div className="mt-6 flex gap-3">

            {socialLinks.map(
              ({ key, url, icon: Icon }, index) => (
                <motion.a
                  key={key}
                  href={url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  initial={{ scale: 1 }}
                  animate={{
                    scale: [1, 1.08, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(227, 30, 36, 0)",
                      "0 0 0 5px rgba(227, 30, 36, 0.10)",
                      "0 0 0 0 rgba(227, 30, 36, 0)",
                    ],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.35,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    y: -3,
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-ink/5
                    bg-ink/5
                    text-ink
                    transition-colors
                    duration-200
                    hover:border-brand
                    hover:bg-brand
                    hover:text-white
                  "
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              )
            )}

          </div>
        </div>


        {/* =========================
            QUICK LINKS
        ========================= */}
        <div
          className="
            lg:border-l
            lg:border-ink/10
            lg:px-10
          "
        >
          <div className="mb-5 flex items-center gap-2">
            <span className="h-[2px] w-5 rounded-full bg-brand" />

            <h4 className="text-sm font-bold uppercase tracking-wider text-brand">
              Quick Links
            </h4>
          </div>
          <ul className="space-y-2.5 text-sm text-panel-muted">
            {[
              "hero",
              "about",
              "services",
              "work",
              "testimonials",
              "contact",
            ].map((id) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className="
                      group
                      flex
                      items-center
                      gap-2.5
                      capitalize
                      transition-colors
                      duration-200
                      hover:text-brand
                    "
                >
                  {/* Bullet */}
                  <span
                    className="
                        h-1.5
                        w-1.5
                        shrink-0
                        rotate-45
                        bg-brand
                        transition-transform
                        duration-200
                        group-hover:scale-125
                      "
                  />

                  <span>
                    {id === "hero" ? "Home" : id}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>


        {/* =========================
            SERVICES
        ========================= */}
        <div
          className="
            lg:border-l
            lg:border-ink/10
            lg:px-10
          "
        >
          <div className="mb-5 flex items-center gap-2">
            <span className="h-[2px] w-5 rounded-full bg-brand" />

            <h4 className="text-sm font-bold uppercase tracking-wider text-brand">
              Services
            </h4>
          </div>
          <ul className="space-y-2.5 text-sm text-panel-muted">
            {services.map((service) => (
              <li key={service.id}>
                <button
                  onClick={() => scrollTo("services")}
                  className="
                      group
                      flex
                      items-center
                      gap-2.5
                      text-left
                      transition-colors
                      duration-200
                      hover:text-brand
                    "
                >
                  {/* Bullet */}
                  <span
                    className="
                      h-1.5
                      w-1.5
                      shrink-0
                      rotate-45
                      bg-brand
                      transition-transform
                      duration-200
                      group-hover:scale-125
                    "
                  />

                  <span>{service.title}</span>
                </button>
              </li>
            ))}

            <li>
              <button
                onClick={() => scrollTo("services")}
                className="
                    group
                    flex
                    items-center
                    gap-2.5
                    text-left
                    transition-colors
                    duration-200
                    hover:text-brand
                  "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    shrink-0
                    rotate-45
                    bg-brand
                    transition-transform
                    duration-200
                    group-hover:scale-125
                  "
                />

                <span>More Event Services</span>
              </button>
            </li>
          </ul>
        </div>


        {/* =========================
            CONTACT
        ========================= */}
        <div
          className="
            lg:border-l
            lg:border-ink/10
            lg:pl-10
          "
        >
          <div className="mb-5 flex items-center gap-2">
            <span className="h-[2px] w-5 rounded-full bg-brand" />

            <h4 className="text-sm font-bold uppercase tracking-wider text-brand">
              Contact
            </h4>
          </div>

          <ul className="space-y-3 text-sm leading-5 text-panel-muted min-w-0">
            <li className="flex items-start gap-2.5 min-w-0">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-brand" />

              <a
                href={`tel:${settings?.phone?.replace(/\s/g, "")}`}
                className="transition-colors duration-200 hover:text-brand"
              >
                {settings?.phone}
              </a>
            </li>

            <li className="flex items-start gap-2.5 min-w-0">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-brand" />

              <a
                href={`mailto:${settings?.email}`}
                className="break-words max-w-full transition-colors duration-200 hover:text-brand"
              >
                {settings?.email}
              </a>
            </li>

            <li className="flex max-w-[280px] items-start gap-2.5 min-w-0">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-brand" />

              <span>
                {settings?.address}
              </span>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-brand" />

              <span>
                {settings?.business_hours}
              </span>
            </li>
          </ul>
        </div>

      </div>


      {/* =========================
          COPYRIGHT
      ========================= */}
      <div className="relative z-10 border-t border-ink/10">

        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-center
            px-5
            py-4
            text-center
            text-[11px]
            leading-5
            text-panel-muted
            sm:px-6
            sm:text-xs
          "
        >
          <p>
            © {new Date().getFullYear()} Yours Perfect Eventz Management.
            All rights reserved.

            <span className="mx-1.5 hidden sm:inline">
              |
            </span>

            <span className="block sm:inline">
              Developed by{" "}
              <a
                href="https://persyntra.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  font-bold
                  text-ink
                  transition-colors
                  duration-200
                  hover:text-brand
                "
              >
                Persyntra Solutions
              </a>
            </span>
          </p>
        </div>

      </div>

    </footer>
  );
}