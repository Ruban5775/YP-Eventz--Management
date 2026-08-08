import { STATS } from "@/data/site";
import { Counter } from "./Counter";
import { SectionTitle } from "./Section";

const COLLAGE = [
  {
    src: "https://res.cloudinary.com/cgutcqdf/image/upload/v1786006507/Product_wyhedl_n2cdzm.jpg?auto=format&fit=crop&w=600&q=80",
    label: "Product Launch",
  },
  {
    src: "https://res.cloudinary.com/cgutcqdf/image/upload/v1786006511/dj_hpd6ac_x3gdfp.webp?auto=format&fit=crop&w=600&q=80",
    label: "DJ & Music",
  },
  {
    src: "https://res.cloudinary.com/cgutcqdf/image/upload/v1786006694/hero2_rrxhvg_coov7h.webp?auto=format&fit=crop&w=600&q=80",
    label: "Award Shows",
  },
   {
    src: "https://res.cloudinary.com/cgutcqdf/image/upload/v1786006524/exi_obwpmd_cufhow.webp?auto=format&fit=crop&w=600&q=80",
    label: "Stall & Exhibitions",
  },
 
  {
    src: "https://res.cloudinary.com/cgutcqdf/image/upload/v1786006693/hero1_v0iugx_khd1si.webp?auto=format&fit=crop&w=600&q=80",
    label: "Annual Meetings",
  },
 
  {
    src: "https://res.cloudinary.com/cgutcqdf/image/upload/v1786006527/corporate_qawl1n_edon4d.webp?auto=format&fit=crop&w=600&q=80",
    label: "Corporate Events",
  },
  {
    src: "https://res.cloudinary.com/cgutcqdf/image/upload/v1786006528/conference2_rh25zo_l8us0a.webp?auto=format&fit=crop&w=600&q=80",
    label: "Conferences",
  },
 
   {
    src: "https://res.cloudinary.com/cgutcqdf/image/upload/v1786006532/celebirity_kmygsf_ykwpyy.webp?auto=format&fit=crop&w=600&q=80",
    label: "Celebrity Shows",
  },
];

function CircularCollage() {
  return (
    <div
      className="
        relative
        mx-auto
        aspect-square
        w-full
        max-w-[260px]

        min-[360px]:max-w-[300px]
        sm:max-w-[360px]
        md:max-w-[430px]
        lg:max-w-[520px]
      "
    >
      {/* Outer Dashed Ring */}
      <div
        aria-hidden
        className="
          absolute
          inset-[4%]
          rounded-full
          border
          border-dashed
          border-brand/25
        "
      />

      {/* Inner Ring */}
      <div
        aria-hidden
        className="
          absolute
          inset-[18%]
          rounded-full
          border
          border-border/60
        "
      />

      {COLLAGE.map((item, i) => {
        const angle =
          (i / COLLAGE.length) * Math.PI * 2 -
          Math.PI / 2;

        // Fixed radius that works on every screen because
        // the whole collage scales.
        const radius = 38;

        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        return (
          <div
            key={item.label}
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            className="
              absolute
              -translate-x-1/2
              -translate-y-1/2
              group
            "
          >
            {/* Photo */}
            <div
              className="
                relative
                h-[52px]
                w-[52px]

                min-[360px]:h-[60px]
                min-[360px]:w-[60px]

                sm:h-[70px]
                sm:w-[70px]

                md:h-[80px]
                md:w-[80px]

                lg:h-[92px]
                lg:w-[92px]

                xl:h-[108px]
                xl:w-[108px]

                overflow-hidden
                rounded-2xl
                bg-white
                p-1
                shadow-soft
                ring-1
                ring-border

                transition-transform
                duration-300

                md:group-hover:-translate-y-1
                md:group-hover:scale-105
              "
            >
              <img
                src={item.src}
                alt={item.label}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>

            {/* Label */}
            <div
              className="
             
              absolute
              left-1/2
              top-full

              mt-2
              sm:mt-2.5
              lg:mt-3

              -translate-x-1/2

              w-[70px]
              min-[360px]:w-[80px]
              sm:w-[92px]
              md:w-[100px]
              lg:w-auto

              text-center

              text-[6px]
              min-[360px]:text-[7px]
              sm:text-[8px]
              md:text-[8px]
              lg:text-[9px]
              xl:text-[10px]

              leading-tight
              font-bold
              uppercase
              tracking-[0.03em]

              text-ink/70

              break-words
              lg:whitespace-nowrap
              "
            >
              {item.label}
            </div>
          </div>
        );
      })}

      {/* Center Logo */}
      <div
        className="
          absolute
          left-1/2
          top-1/2

          flex
          items-center
          justify-center

          -translate-x-1/2
          -translate-y-1/2

          h-[32%]
          w-[32%]

          sm:h-[33%]
          sm:w-[33%]

          md:h-[34%]
          md:w-[34%]

          xl:h-[36%]
          xl:w-[36%]

          rounded-full
          bg-white
          p-4

          sm:p-5
          lg:p-6

          shadow-brand
          ring-1
          ring-border
        "
      >
        <img
          src="/YP-Logo.png"
          alt="Yours Perfect Event Management"
          className="h-full w-full object-contain"
        />
      </div>

      {/* Decorative Dots */}
      <span
        aria-hidden
        className="
          hidden
          sm:block

          absolute
          right-[1%]
          top-1/2

          h-2
          w-2
          rounded-full
          bg-brand
        "
      />

      <span
        aria-hidden
        className="
          hidden
          sm:block

          absolute
          left-[2%]
          top-[34%]

          h-1.5
          w-1.5
          rounded-full
          bg-brand/70
        "
      />
    </div>
  );
}

export function About() {
  return (
    <section
      id="about"
      className="
        relative
        overflow-hidden
        bg-white
        py-24
        sm:py-32
      "
    >
      {/* Subtle Background Decoration */}
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute
          -left-32
          top-20
          h-72
          w-72
          rounded-full
          bg-brand/5
          blur-3xl
        "
      />

      <div
        aria-hidden
        className="
          pointer-events-none
          absolute
          -right-32
          bottom-10
          h-80
          w-80
          rounded-full
          bg-ink/5
          blur-3xl
        "
      />

      {/* Main Content */}
      <div
        className="
          relative
          mx-auto
          grid
          max-w-7xl
          grid-cols-1
          gap-16
          px-4

          sm:px-6

          xl:grid-cols-[540px_minmax(0,1fr)]
          lg:items-center
          lg:gap-16
          lg:px-10

          xl:gap-20
        "
      >
        {/* Circular Collage */}
       <div
          className="
            relative
            flex
            justify-center
            px-3

          sm:px-6

          lg:px-2

          xl:px-0
          "
        >
          <CircularCollage />
        </div>

        {/* About Content */}
        <div>
          <SectionTitle
              eyebrow="About Us"
              title={
                <>
                  A decade of{" "}
                  <span className="text-brand">
                    flawless
                  </span>{" "}
                  event execution.
                </>
              }
              subtitle="Salem's most trusted event production house. We plan, design and execute events that leave rooms speechless—from intimate ceremonies to 10,000-guest activations."
            />

           {/* Service Area */}
            <div
              className="
                mt-5
                inline-flex
                max-w-full
                items-center
                gap-1.5

                rounded-full
                border
                border-emerald-200
                bg-emerald-50

                px-2.5
                py-1.5

                text-[11px]
                font-semibold
                text-emerald-700

                min-[360px]:px-3
                min-[360px]:text-xs

                sm:px-3.5
                sm:py-2
                sm:text-sm

                lg:px-4
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="
                  h-4
                  w-4
                  shrink-0
                  text-emerald-600

                  sm:h-5
                  sm:w-5
                "
              >
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
              </svg>

              <span
                className="
                  font-semibold
                  tracking-[0.02em]
                  leading-none

                  whitespace-nowrap
                "
              >
                Executing Events Across Tamil Nadu
              </span>
            </div>

            {/* Description */}
            <p className="mt-6 text-muted-foreground leading-8">
              Our in-house team of designers, producers and technicians work as one—
              obsessed with the details that others miss. Every event we deliver is a
              promise kept: on brief, on time, on budget.
            </p>

          {/* Stats */}
          <div
            className="
              mt-10
              grid
              grid-cols-2
              gap-3

              sm:grid-cols-4
              sm:gap-4
            "
          >
            {STATS.map((s) => {
              const words =
                s.label.trim().split(/\s+/);

              const firstLine =
                words[0];

              const secondLine =
                words.slice(1).join(" ");

              return (
                <div
                  key={s.label}
                  className="
                    group
                    flex
                    min-h-[100px]
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-border
                    bg-surface
                    px-3
                    py-4
                    text-center

                    transition-transform
                    duration-200

                    hover:-translate-y-1

                    sm:min-h-[115px]
                    sm:px-4
                  "
                >
                  {/* Animated Counter */}
                  <div
                    className="
                      text-2xl
                      font-black
                      leading-none
                      text-brand

                      sm:text-3xl
                    "
                  >
                    <Counter
                      to={s.value}
                      suffix={s.suffix}
                    />
                  </div>

                  {/* Label */}
                  <div
                    className="
                      mt-3
                      min-h-[36px]
                      text-xs
                      font-medium
                      leading-[18px]
                      text-muted-foreground
                    "
                  >
                    {/* Mobile */}
                    <span className="block whitespace-nowrap sm:hidden">
                      {s.label}
                    </span>

                    {/* Tablet / Desktop */}
                    <div className="hidden sm:flex sm:flex-col sm:items-center">
                      <span>
                        {firstLine}
                      </span>

                      {secondLine && (
                        <span>
                          {secondLine}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}