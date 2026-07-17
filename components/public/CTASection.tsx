"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buildWhatsappLink } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import Reveal from "@/components/common/Reveal";

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
  const doctor = useDoctorProfile();
  const whatsapp = buildWhatsappLink(doctor.contactWhatsapp);
  const resolvedSecondary = secondaryHref ?? whatsapp;

  if (dark) {
    return (
      <section className="py-xl px-gutter">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="bg-primary p-xl rounded-2xl relative overflow-hidden shadow-xl">
            {/* decorative circles */}
            <motion.div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-xl">
              <div>
                <h2 className="text-headline-lg font-bold text-on-primary mb-sm">{title}</h2>
                <p className="text-body-lg text-on-primary/80 max-w-lg">{subtitle}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-sm w-full md:w-auto shrink-0">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={primaryHref}
                    className="block bg-white text-primary px-xl py-md rounded-xl text-label-md font-semibold hover:bg-surface-container transition-colors text-center shadow-md"
                  >
                    {primaryLabel}
                  </Link>
                </motion.div>
                <motion.a
                  href={resolvedSecondary}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="border-2 border-white/60 text-on-primary px-xl py-md rounded-xl text-label-md font-semibold hover:bg-white/10 transition-colors text-center"
                >
                  {secondaryLabel}
                </motion.a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className="py-xl px-gutter text-center">
      <Reveal className="max-w-3xl mx-auto space-y-md">
        <h2 className="text-headline-lg font-bold text-on-surface">{title}</h2>
        <p className="text-body-lg text-on-surface-variant">{subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-md justify-center pt-md">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={primaryHref}
              className="block bg-primary text-on-primary px-xl py-md rounded-xl text-label-md font-semibold hover:opacity-90 transition-colors shadow-lg"
            >
              {primaryLabel}
            </Link>
          </motion.div>
          <motion.a
            href={resolvedSecondary}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="border border-outline-variant text-primary px-xl py-md rounded-xl text-label-md font-semibold hover:bg-surface-container transition-colors"
          >
            {secondaryLabel}
          </motion.a>
        </div>
      </Reveal>
    </section>
  );
}
