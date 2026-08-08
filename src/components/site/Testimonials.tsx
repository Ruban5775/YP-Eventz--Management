import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import {
  CLIENT_LOGOS,
  loadTestimonials,
  type Testimonial,
} from "@/data/site";

import { SectionTitle } from "./Section";

/* =========================
   GOOGLE LOGO
========================= */

function GoogleG({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />

      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />

      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />

      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/* =========================
   REVIEW CARD
========================= */

function ReviewCard({
  t,
}: {
  t: Testimonial;
}) {
  const initials = t.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="
        group
        relative
        flex
        h-full
        min-h-[245px]
        flex-col
        rounded-2xl
        border
        border-black/5
        bg-white
        p-5
        shadow-[0_12px_35px_-15px_rgba(0,0,0,0.25)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-brand/50
        hover:shadow-[0_25px_45px_-15px_rgba(0,0,0,0.3)]
        sm:p-6
      "
    >
      {/* Reviewer Information */}
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-brand
            text-sm
            font-bold
            uppercase
            text-white
            ring-2
            ring-brand/20
            sm:h-14
            sm:w-14
            sm:text-base
          "
        >
          {initials}
        </div>

        {/* Name / Date / Google */}
        <div className="min-w-0 flex-1">

          <div className="flex items-center justify-between gap-3">
            <div className="truncate font-bold text-ink">
              {t.name}
            </div>

            <GoogleG className="h-5 w-5 shrink-0" />
          </div>

          <div className="mt-0.5 text-sm text-muted-foreground">
            {t.date}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mt-4 flex gap-1 text-[15px]">
        {Array.from({ length: 5 }).map(
          (_, k) => (
            <FaStar
              key={k}
              className={
                k < Number(t.rating)
                  ? "text-amber-400"
                  : "text-black/15"
              }
            />
          )
        )}
      </div>

      {/* Review */}
      <p className="mt-3 text-sm leading-6 text-ink/80">
        {t.review}
      </p>
    </div>
  );
}

/* =========================
   TESTIMONIALS
========================= */

export function Testimonials() {

  /* Testimonials from Database */
  const [
    testimonials,
    setTestimonials,
  ] = useState<Testimonial[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [page, setPage] =
    useState(0);

  const perPage =
    useSlidesPerPage();

  /* =========================
     FETCH TESTIMONIALS
  ========================= */

  useEffect(() => {
    const fetchTestimonials =
      async () => {
        try {
          setLoading(true);

          const data =
            await loadTestimonials();

          setTestimonials(data);
        } catch (error) {
          console.error(
            "Unable to load testimonials:",
            error
          );
        } finally {
          setLoading(false);
        }
      };

    fetchTestimonials();
  }, []);

  /* =========================
     PAGINATION
  ========================= */

  const pages = Math.max(
    1,
    Math.ceil(
      testimonials.length /
        perPage
    )
  );

  /* Reset page when screen changes */
  useEffect(() => {
    setPage(0);
  }, [perPage]);

  /* Auto Slide */
  useEffect(() => {
    if (
      pages <= 1 ||
      testimonials.length === 0
    ) {
      return;
    }

    const timer =
      setInterval(() => {
        setPage(
          (p) =>
            (p + 1) % pages
        );
      }, 6500);

    return () =>
      clearInterval(timer);

  }, [
    pages,
    testimonials.length,
  ]);

  const start =
    page * perPage;

  const items =
    testimonials.slice(
      start,
      start + perPage
    );

  const previousPage = () => {
    setPage(
      (p) =>
        (p - 1 + pages) %
        pages
    );
  };

  const nextPage = () => {
    setPage(
      (p) =>
        (p + 1) % pages
    );
  };

  return (
    <section
      id="testimonials"
      className="
        relative
        overflow-hidden
        bg-panel
        py-20
        sm:py-24
        lg:py-28
      "
    >

      {/* Soft Background Decoration */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-30
        "
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 20% 20%, rgba(227,30,36,0.15), transparent 60%), radial-gradient(60% 40% at 80% 80%, rgba(255,255,255,0.2), transparent 60%)",
        }}
      />

      {/* Main Content */}
      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-4
          sm:px-6
          lg:px-10
        "
      >

        <SectionTitle
          center
          eyebrow="Testimonials"
          title={
            <>
              What our{" "}
              <span className="text-brand">
                clients
              </span>{" "}
              say.
            </>
          }
        />

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div
            className="
              mt-14
              flex
              min-h-[245px]
              items-center
              justify-center
            "
          >
            <p className="text-sm text-muted-foreground">
              Loading testimonials...
            </p>
          </div>
        )}

        {/* =========================
            NO TESTIMONIALS
        ========================= */}

        {!loading &&
          testimonials.length ===
            0 && (
            <div
              className="
                mt-14
                flex
                min-h-[200px]
                items-center
                justify-center
                text-center
              "
            >
              <p className="text-sm text-muted-foreground">
                No testimonials
                available yet.
              </p>
            </div>
          )}

        {/* =========================
            TESTIMONIAL SLIDER
        ========================= */}

        {!loading &&
          testimonials.length >
            0 && (
            <div className="relative mt-12 sm:mt-14">

              {/* Previous Arrow */}
              {pages > 1 && (
                <button
                  type="button"
                  onClick={
                    previousPage
                  }
                  aria-label="Previous testimonials"
                  className="
                    absolute
                    left-0
                    top-1/2
                    z-20
                    hidden
                    h-11
                    w-11
                    -translate-x-1/2
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-black/10
                    bg-white
                    text-ink
                    shadow-lg
                    transition-all
                    duration-300
                    hover:scale-110
                    hover:border-brand
                    hover:bg-brand
                    hover:text-white
                    sm:flex
                    lg:-left-2
                  "
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Next Arrow */}
              {pages > 1 && (
                <button
                  type="button"
                  onClick={
                    nextPage
                  }
                  aria-label="Next testimonials"
                  className="
                    absolute
                    right-0
                    top-1/2
                    z-20
                    hidden
                    h-11
                    w-11
                    translate-x-1/2
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-black/10
                    bg-white
                    text-ink
                    shadow-lg
                    transition-all
                    duration-300
                    hover:scale-110
                    hover:border-brand
                    hover:bg-brand
                    hover:text-white
                    sm:flex
                    lg:-right-2
                  "
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              )}

              {/* Cards */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="
                    grid
                    items-stretch
                    gap-5
                    sm:grid-cols-2
                    lg:grid-cols-3
                  "
                >
                  {items.map(
                    (t) => (
                      <ReviewCard
                        key={t.id}
                        t={t}
                      />
                    )
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Pagination */}
              {pages > 1 && (
                <div
                  className="
                    mt-8
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  {Array.from({
                    length:
                      pages,
                  }).map(
                    (_, k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() =>
                          setPage(
                            k
                          )
                        }
                        aria-label={`Go to testimonial page ${
                          k + 1
                        }`}
                        className={`
                          h-2
                          rounded-full
                          transition-all
                          duration-300
                          ${
                            k ===
                            page
                              ? "w-8 bg-brand"
                              : "w-2 bg-black/25 hover:bg-black/40"
                          }
                        `}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}
      </div>
      {/* =========================
          CLIENT LOGOS
      ========================= */}

      <div className="relative mt-16 sm:mt-20 lg:mt-24">

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Trusted by brands & families across India
          </div>
        </div>

        {/* Logo Marquee */}
        <div
          className="
            group
            relative
            mt-8
            overflow-hidden
            [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
          "
        >
          <div className="flex w-max marquee-track group-hover:[animation-play-state:paused]">

            {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map(
              (client, k) => (
                <div
                  key={k}
                  className="
                    mx-4
                    flex
                    h-18
                    w-36
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-border
                    bg-white
                    px-5
                    shadow-soft
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-md
                    sm:mx-6
                    sm:w-40
                    lg:mx-8
                  "
                >
                  <img
                    src={client.logo}
                    alt={client.name}
                    loading="lazy"
                    decoding="async"
                    className="
                      max-h-12
                      max-w-full
                      object-contain
                    "
                  />
                </div>
              )
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
   RESPONSIVE SLIDE COUNT
========================= */

function useSlidesPerPage() {
  const getSlidesPerPage = () => {
    if (typeof window === "undefined") {
      return 3;
    }

    if (window.innerWidth >= 1024) {
      return 3;
    }

    if (window.innerWidth >= 640) {
      return 2;
    }

    return 1;
  };

  const [n, setN] = useState(getSlidesPerPage);

  useEffect(() => {
    const handleResize = () => {
      setN(getSlidesPerPage());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  return n;
}