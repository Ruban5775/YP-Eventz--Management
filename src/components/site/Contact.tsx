import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiMail, FiMapPin, FiPhone, FiSend } from "react-icons/fi";
import { FaWhatsapp, FaClock } from "react-icons/fa";
import { z } from "zod";
import { toast } from "sonner";
import { loadEventServices, EventService } from "@/data/site";
import { SectionTitle } from "./Section";
import { useSettings } from "@/context/SettingsProvider";

const API_BASE = import.meta.env.VITE_API_BASE;

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Enter valid phone").max(10),
  type: z.string().min(1, "Select an event type"),

  eventDate: z.string().min(1, "Select event date"),

  location: z.string().trim().min(2, "Enter location").max(120),
  message: z.string().trim().min(10, "Tell us a bit more").max(1000),
});

export function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { settings, loading } = useSettings();
  const [eventTypes, setEventTypes] = useState<EventService[]>([]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    const res = schema.safeParse(data);

    if (!res.success) {
      const errs: Record<string, string> = {};

      res.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });

      setErrors(errs);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/contact.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(res.data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);

        // Reset form
        form.reset();

        // Clear validation errors
        setErrors({});
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Server Error");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const data = await loadEventServices();
      setEventTypes(data);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load event types.");
    }
  };
  const inputCls = "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <section id="contact" className="relative bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <SectionTitle
          center
          eyebrow="Contact"
          title={
            <>
              Let's design your{" "}
              <span className="text-brand">next event</span>.
            </>
          }
          subtitle="Share a few details — we'll reply within one business day with a custom quote."
        />

        {/* Main Contact Layout */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">

          {/* LEFT SIDE - CONTACT FORM */}
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8"
          >
            <h3 className="mb-6 text-xl font-bold text-ink">
              Send Us a Message
            </h3>

            <div className="space-y-4">

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Name *
                </label>

                <input
                  name="name"
                  className={inputCls}
                  placeholder="Your full name"
                />

                {errors.name && (
                  <p className="mt-1 text-xs text-brand">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Email *
                </label>

                <input
                  name="email"
                  type="email"
                  className={inputCls}
                  placeholder="you@company.com"
                />

                {errors.email && (
                  <p className="mt-1 text-xs text-brand">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Phone *
                </label>

                <input
                  name="phone"
                  type="tel"
                  className={inputCls}
                  maxLength={10}
                  placeholder="+91 ..."
                />

                {errors.phone && (
                  <p className="mt-1 text-xs text-brand">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Event Type */}
              {/* Event Type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Event Type *
                </label>

                <select
                  name="type"
                  defaultValue=""
                  className={inputCls}
                >
                  <option value="" disabled>
                    Select event type
                  </option>

                  {/* Dynamic services from database */}
                  {eventTypes.map((service) => (
                    <option
                      key={service.id}
                      value={service.title}
                    >
                      {service.title}
                    </option>
                  ))}

                  {/* Static Other Event option */}
                  <option value="Other Event">
                    Other Event
                  </option>
                </select>

                {errors.type && (
                  <p className="mt-1 text-xs text-brand">
                    {errors.type}
                  </p>
                )}
              </div>

              {/* Event Date */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Event Date *
                </label>

                <input
                  type="date"
                  name="eventDate"
                  min={new Date().toISOString().split("T")[0]}
                  className={inputCls}
                />

                {errors.eventDate && (
                  <p className="mt-1 text-xs text-brand">
                    {errors.eventDate}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Location *
                </label>

                <input
                  name="location"
                  className={inputCls}
                  placeholder="City / venue"
                />

                {errors.location && (
                  <p className="mt-1 text-xs text-brand">
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                  Message *
                </label>

                <textarea
                  name="message"
                  rows={4}
                  className={inputCls}
                  placeholder="Tell us about your event..."
                />

                {errors.message && (
                  <p className="mt-1 text-xs text-brand">
                    {errors.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Enquiry"}
              <FiSend />
            </button>
          </motion.form>


          {/* RIGHT SIDE */}
          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex h-full flex-col"
          >
            {/* CONTACT DETAILS */}
            <div className="rounded-3xl bg-panel p-6 text-panel-foreground shadow-soft sm:p-8">
              <h3 className="text-xl font-bold text-ink">
                Get in touch
              </h3>

              <div className="mt-6 space-y-4 text-sm">
                <Row
                  icon={<FiPhone />}
                  label="Phone"
                  value={settings?.phone ?? ""}
                  href={`tel:${settings?.phone?.replace(/\s/g, "")}`}
                />

                  <Row
                  icon={<FaWhatsapp />}
                  label="WhatsApp"
                  value={settings?.whatsapp ?? ""}
                  href={`https://wa.me/${settings?.whatsapp}`}
                />

                <Row
                  icon={<FiMail />}
                  label="Email"
                  value={settings?.email ?? ""}
                  href={`mailto:${settings?.email}`}
                />
           

                <Row
                  icon={<FiMapPin />}
                  label="Address"
                  value={settings?.address ?? ""}
                />
                

                <Row
                  icon={<FaClock />}
                  label="Business Hours"
                  value={settings?.business_hours ?? ""}
                />
              </div>
            </div>

            {/* MAP */}
            <div className="mt-6 min-h-[300px] flex-1 overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
              <iframe
                src={settings?.map_embed}
                title="Map"
                loading="lazy"
                className="h-full min-h-[300px] w-full border-0"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );


  function Row({
    icon,
    label,
    value,
    href,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
  }) {
    const inner = (
      <div className="flex items-start gap-3">

        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          {icon}
        </span>

        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-panel-muted">
            {label}
          </div>

          <div className="text-sm text-ink">
            {value}
          </div>
        </div>

      </div>
    );

    return href ? (
      <a
        href={href}
        className="block transition hover:opacity-80"
      >
        {inner}
      </a>
    ) : (
      inner
    );
  }
}