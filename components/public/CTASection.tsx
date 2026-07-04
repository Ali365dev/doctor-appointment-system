import Link from "next/link";
import { doctor } from "@/lib/data";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryHref?: string;
  secondaryHref?: string;
  dark?: boolean;
}

export default function CTASection({
  title = "Ready to Prioritize Your Digestive Health?",
  subtitle = "Schedule a consultation with Dr. Zaid Gul to discuss your symptoms and start your journey towards improved health.",
  primaryLabel = "Book Your Appointment",
  secondaryLabel = "Contact Office",
  primaryHref = "/book-appointment/step-1",
  secondaryHref,
  dark = false,
}: CTASectionProps) {
  const whatsapp = doctor.contact.whatsapp;
  const resolvedSecondary = secondaryHref ?? whatsapp;

  if (dark) {
    return (
      <section className="py-xl px-gutter">
        <div className="max-w-[1280px] mx-auto">
          <div className="bg-primary p-xl rounded-2xl relative overflow-hidden shadow-xl">
            {/* decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-xl">
              <div>
                <h2 className="text-headline-lg font-bold text-on-primary mb-sm">{title}</h2>
                <p className="text-body-lg text-on-primary/80 max-w-lg">{subtitle}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-sm w-full md:w-auto shrink-0">
                <Link
                  href={primaryHref}
                  className="bg-white text-primary px-xl py-md rounded-xl text-label-md font-semibold hover:bg-surface-container transition-all text-center shadow-md"
                >
                  {primaryLabel}
                </Link>
                <a
                  href={resolvedSecondary}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-white/60 text-on-primary px-xl py-md rounded-xl text-label-md font-semibold hover:bg-white/10 transition-all text-center"
                >
                  {secondaryLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-xl px-gutter text-center">
      <div className="max-w-3xl mx-auto space-y-md">
        <h2 className="text-headline-lg font-bold text-on-surface">{title}</h2>
        <p className="text-body-lg text-on-surface-variant">{subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-md justify-center pt-md">
          <Link
            href={primaryHref}
            className="bg-primary text-on-primary px-xl py-md rounded-xl text-label-md font-semibold hover:opacity-90 transition-all shadow-lg"
          >
            {primaryLabel}
          </Link>
          <a
            href={resolvedSecondary}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-outline-variant text-primary px-xl py-md rounded-xl text-label-md font-semibold hover:bg-surface-container transition-all"
          >
            {secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
