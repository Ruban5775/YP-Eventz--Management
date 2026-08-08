// website work.tsx

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiZoomIn,
} from "react-icons/fi";

import {
  loadWork,
  loadEventServices,
  loadEventMedia,
  WorkItem,
  WorkMedia,
  EventService,
} from "@/data/site";
 
import { SectionTitle } from "./Section";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE;

export function Work() {

  const [cat, setCat] = useState("All");

  const [services, setServices] = useState<EventService[]>([]);
  const [visible, setVisible] = useState(8);

  const [active, setActive] = useState<WorkItem | null>(null);
  const [gallery, setGallery] = useState<WorkMedia[]>([]);

  const [idx, setIdx] = useState(0);

  const [works, setWorks] = useState<WorkItem[]>([]);

  const [loadingMedia, setLoadingMedia] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Events
  |--------------------------------------------------------------------------
  */

  const load = async () => {

    try {

      const data = await loadWork();

      setWorks(data);

    } catch (e) {

      console.error(e);

    }

  };

  /*
  |--------------------------------------------------------------------------
  | Load Categories
  |--------------------------------------------------------------------------
  */

  const loadCategories = async () => {

    try {

      const data = await loadEventServices();

      setServices(data);

    } catch (e) {

      console.error(e);

    }

  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    load();

    loadCategories();

  }, []);

  /*
  |--------------------------------------------------------------------------
  | Filter Events
  |--------------------------------------------------------------------------
  */

  const filtered = useMemo(() => {

    if (cat === "All") {

      return works;

    }

    return works.filter(
      (work) =>
        work.category.trim().toLowerCase() ===
        cat.trim().toLowerCase()
    );

  }, [works, cat]);

  const shown = filtered.slice(0, visible);

  /*
  |--------------------------------------------------------------------------
  | Open Event
  |--------------------------------------------------------------------------
  */

  const open = async (work: WorkItem) => {

    setActive(work);

    setIdx(0);

    setGallery([]);

    setLoadingMedia(true);

    try {

      const media = await loadEventMedia(work.id);

      setGallery(media);

    } catch (error) {

      console.error(
        "Unable to load event media:",
        error
      );

    } finally {

      setLoadingMedia(false);

    }

  };

  /*
  |--------------------------------------------------------------------------
  | Close Event
  |--------------------------------------------------------------------------
  */

  const close = () => {

    setActive(null);

    setGallery([]);

    setIdx(0);

    setLoadingMedia(false);

  };

  /*
  |--------------------------------------------------------------------------
  | Next Media
  |--------------------------------------------------------------------------
  */

  const next = () => {

    if (gallery.length === 0) return;

    setIdx(
      (current) =>
        (current + 1) % gallery.length
    );

  };

  /*
  |--------------------------------------------------------------------------
  | Previous Media
  |--------------------------------------------------------------------------
  */

  const prev = () => {

    if (gallery.length === 0) return;

    setIdx(
      (current) =>
        (current - 1 + gallery.length) %
        gallery.length
    );

  };

  return (

    <section
      id="work"
      className="relative bg-white py-24 sm:py-32"
    >

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">

        <SectionTitle
          center
          eyebrow="Our Work"
          title={
            <>
              Recent events,{" "}
              <span className="text-brand">
                unforgettable moments
              </span>
              .
            </>
          }
          subtitle="A curated look at what we've built for brands, couples and communities across India."
        />

        {/* Categories */}

        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">

          {[
            {
              id: 0,
              title: "All",
            },
            ...services,
          ].map((service) => (

            <button
              key={service.id}
              onClick={() => {

                setCat(service.title);

                setVisible(8);

              }}
              className={cn(

                "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all sm:text-sm",

                cat === service.title

                  ? "border-brand bg-brand text-white shadow-brand"

                  : "border-border bg-white text-ink hover:border-ink"

              )}
            >

              {service.title}

            </button>

          ))}

        </div>

        {/* Event Grid */}

      {/* Event Grid */}

<div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
  {shown.map((w, k) => (
    <motion.button
      key={w.id}
      onClick={() => open(w)}
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-40px",
      }}
      transition={{
        duration: 0.45,
        delay: (k % 8) * 0.04,
      }}
      whileTap={{ scale: 0.98 }}
      className="
        group relative block overflow-hidden rounded-2xl
        border border-ink/10 bg-white text-left
        shadow-soft ring-1 ring-black/5
        transition-all duration-500 ease-out

        lg:hover:-translate-y-2
        lg:hover:border-brand
        lg:hover:ring-brand/20
        lg:hover:shadow-[0_18px_45px_-18px_rgba(220,38,38,0.45)]
      "
    >

      {/* Cover Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">

        <img
          src={w.cover_image_url}
          alt={w.title}
          loading="lazy"
          decoding="async"
          className="
            h-full w-full object-cover
            transition-transform duration-700 ease-out
            lg:group-hover:scale-110
          "
        />

        {/* Desktop Hover Overlay */}
        <div
          className="
            pointer-events-none absolute inset-0
            hidden bg-black/40
            opacity-0 backdrop-blur-[1px]
            transition-all duration-500
            lg:block
            lg:group-hover:opacity-100
          "
        />

        {/* Desktop View Gallery Button */}
        <div
          className="
            absolute inset-0
            hidden items-center justify-center
            opacity-0
            transition-all duration-500
            lg:flex
            lg:group-hover:opacity-100
          "
        >
          <div
            className="
              flex translate-y-4 items-center gap-2
              rounded-full bg-white
              px-5 py-2.5
              text-xs font-bold uppercase
              tracking-wider text-ink
              shadow-lg
              transition-all duration-500
              group-hover:translate-y-0
            "
          >
            <FiZoomIn className="text-brand" />
            View Event
          </div>
        </div>

        {/* Mobile Zoom Icon */}
        <div
          className="
            absolute right-2 top-2
            flex h-8 w-8 items-center justify-center
            rounded-full bg-white/95
            text-ink shadow-md
            sm:right-3 sm:top-3
            sm:h-9 sm:w-9
            lg:hidden
          "
        >
          <FiZoomIn />
        </div>

      </div>

      {/* Card Information */}
      <div
        className="
          relative px-3 py-3
          sm:px-4 sm:py-4
        "
      >
        {/* Small Brand Accent */}
        <div
          className="
            absolute left-0 top-0
            h-[2px] w-0 bg-brand
            transition-all duration-500
            lg:group-hover:w-full
          "
        />

        {/* Title */}
        <div
          className="
            truncate text-sm font-bold text-ink
            transition-colors duration-300
            sm:text-base
            lg:group-hover:text-brand
          "
        >
          {w.title}
        </div>

        {/* Category */}
        <div
          className="
            mt-1 truncate
            text-[9px] font-bold uppercase
            tracking-[0.1em] text-brand
            sm:text-[10px]
            sm:tracking-[0.15em]
          "
        >
          {w.category}
        </div>

        {/* Date */}
        <div className="mt-1.5 text-[10px] text-muted-foreground sm:text-xs">
          {new Date(w.event_date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

      </div>

    </motion.button>
  ))}
</div>

        {/* Load More */}

        {visible < filtered.length && (

          <div className="mt-12 flex justify-center">

            <button
              onClick={() =>
                setVisible(
                  (value) => value + 6
                )
              }
              className="rounded-full border-2 border-ink px-8 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white"
            >

              Load More

            </button>

          </div>

        )}

      </div>

      {/* Event Gallery Modal */}

      <AnimatePresence>

        {active && (

          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 backdrop-blur"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={close}
          >

            {/* Close */}

            <button
              onClick={close}
              className="absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >

              <FiX className="h-5 w-5" />

            </button>

            {/* Previous */}

            {gallery.length > 1 && (

              <button
                onClick={(e) => {

                  e.stopPropagation();

                  prev();

                }}
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-8"
              >

                <FiChevronLeft className="h-6 w-6" />

              </button>

            )}

            {/* Next */}

            {gallery.length > 1 && (

              <button
                onClick={(e) => {

                  e.stopPropagation();

                  next();

                }}
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8"
              >

                <FiChevronRight className="h-6 w-6" />

              </button>

            )}

            {/* Loading */}

            {loadingMedia && (

              <div
                className="text-sm font-semibold text-white"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                Loading media...

              </div>

            )}

            {/* Gallery */}

            {!loadingMedia &&
              gallery.length > 0 && (

                <motion.div
                  key={`${active.id}-${idx}`}
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="relative flex max-h-[85vh] w-full max-w-5xl items-center justify-center overflow-hidden rounded-2xl"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  {gallery[idx].media_type ===
                  "image" ? (

                    <img
                      src={gallery[idx].media_url}
                      alt={active.title}
                      loading="eager"
                      decoding="async"
                      className="max-h-[85vh] max-w-full object-contain"
                    />

                  ) : (

                    <video
                  controls
                  playsInline
                  preload="metadata"
                  className="max-h-[85vh] max-w-full object-contain"
              >
                  <source
                      src={gallery[idx].media_url}
                      type="video/mp4"
                  />
                  Your browser does not support video.
              </video>
                    

                  )}
                  

                  {/* Details */}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">

                    <div className="inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand shadow-sm">

                      {active.category}

                    </div>

                    <div className="mt-1 text-lg font-bold sm:text-2xl">

                      {active.title}

                    </div>

                    <div className="mt-1 text-xs text-white/70">

                      {idx + 1} /{" "}
                      {gallery.length}

                    </div>

                  </div>

                </motion.div>

              )}

            {/* No Media */}

            {!loadingMedia &&
              gallery.length === 0 && (

                <div
                  className="text-center text-white"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  <p>
                    No media available for this event.
                  </p>

                </div>

              )}

          </motion.div>

        )}

      </AnimatePresence>

    </section>

  );

}