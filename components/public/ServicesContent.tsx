"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { doctor } from "@/lib/data";
import ProcedureCard from "@/components/public/ProcedureCard";
import CTASection from "@/components/public/CTASection";
import Reveal from "@/components/common/Reveal";
import RevealGroup, { revealItem } from "@/components/common/RevealGroup";

const PREP_STEPS = [
  {
    num: "01",
    title: "Fast Protocol",
    body: "Patients must fast (no food or liquids) for at least 8–12 hours prior to Endoscopy or Colonoscopy procedures.",
  },
  {
    num: "02",
    title: "Bowel Cleansing",
    body: "A specific laxative regimen will be provided upon booking. Complete the entire preparation to ensure clear visualization.",
  },
  {
    num: "03",
    title: "Medication Review",
    body: "Inform our staff of any blood thinners or diabetic medications you are currently taking at least 5 days before the procedure.",
  },
];

const FEATURE_TILES = [
  { icon: "verified_user", label: "Certified Safety", bg: "bg-surface-container-high", color: "text-primary" },
  { icon: "medical_information", label: "Detailed Reports", bg: "bg-primary", color: "text-on-primary" },
  { icon: "psychology", label: "Expert Insight", bg: "bg-secondary-container", color: "text-on-secondary-container" },
  { icon: "support_agent", label: "24/7 Support", bg: "bg-surface-container-high", color: "text-primary" },
];

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD8Fl9bfESyniMxUDMxazH5L5msPPi4PznZ2TzyyUg_pNYKZMY-R57isUNVA5Q9khwloJZY0KzdJHYYre6wsjbKwPpUt2pWRGb63nvLUv095thZFZiilpxMVeUSZP520ZWck58M7G22JiwDG8GIey9sRd0VwrfxesVpyp1qUKL8bC3IEErtQtL03m10SJLs0S9qlqel0N4jR3WstiS8zq9dmTuEWefr0O7FgBtm9JU4enmB9WSmwm4ZLYAniLKu1hFwkpHxFoq7e-Y";

export default function ServicesContent() {
  const { treatments_offered } = doctor;

  // ERCP is the most specialized (highest price)
  const sorted = [...treatments_offered].sort(
    (a, b) => b.price_pkr - a.price_pkr
  );

  return (
    <main className="pt-24">
      {/* ── Hero ── */}
      <section className="relative py-xl overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-gutter">
          <div className="flex flex-col md:flex-row items-center gap-xl">
            <Reveal className="w-full md:w-1/2">
              <span className="inline-block px-sm py-xs bg-primary-fixed text-on-primary-fixed-variant text-label-md font-semibold rounded-full mb-md">
                PREMIUM CLINICAL SERVICES
              </span>
              <h1 className="text-display font-bold mb-md text-on-surface">
                Procedures &amp; Transparency
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-xl">
                Specialized gastroenterology care with transparent pricing. We
                prioritize diagnostic accuracy and patient comfort above all
                else.
              </p>
              <div className="flex flex-wrap gap-sm mt-lg">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/book-appointment/step-1"
                    className="block bg-primary text-on-primary px-lg py-sm rounded-xl text-label-md font-semibold hover:opacity-90 transition-colors shadow-lg"
                  >
                    Book a Procedure
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/appointment"
                    className="block border border-outline-variant text-on-surface px-lg py-sm rounded-xl text-label-md font-semibold hover:bg-surface-container transition-colors"
                  >
                    View Conditions
                  </Link>
                </motion.div>
              </div>
            </Reveal>
            <motion.div
              className="w-full md:w-1/2 relative h-100"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <motion.div
                className="absolute inset-0 rounded-xl overflow-hidden shadow-xl bg-cover bg-center"
                style={{ backgroundImage: `url('${HERO_IMG}')` }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
                aria-label="Advanced medical facility"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pricing Grid ── */}
      <section className="py-xl bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto px-gutter">
          <Reveal className="text-center mb-xl">
            <h2 className="text-headline-lg font-bold mb-sm text-on-surface">
              Treatments Offered
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Standardized pricing for high-precision diagnostic and therapeutic
              procedures.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {sorted.map((t, i) => (
              <ProcedureCard
                key={t.name}
                treatment={t}
                featured={i === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Preparation Guide ── */}
      <section className="py-xl">
        <div className="max-w-[1280px] mx-auto px-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
            {/* Steps */}
            <Reveal>
              <h2 className="text-headline-lg font-bold mb-md text-on-surface">
                Preparation Guide
              </h2>
              <p className="text-body-lg text-on-surface-variant mb-lg">
                Accurate results depend on proper preparation. Please follow
                these clinical protocols carefully prior to your appointment.
              </p>
              <RevealGroup className="space-y-md">
                {PREP_STEPS.map((step) => (
                  <motion.div key={step.num} variants={revealItem} className="flex gap-md group">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-semibold text-headline-md group-hover:scale-110 transition-transform">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-headline-md font-semibold mb-xs">
                        {step.title}
                      </h4>
                      <p className="text-body-md text-on-surface-variant">
                        {step.body}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </RevealGroup>
            </Reveal>

            {/* Feature grid */}
            <RevealGroup className="grid grid-cols-2 gap-md">
              {FEATURE_TILES.map((tile) => (
                <motion.div
                  key={tile.label}
                  variants={revealItem}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className={`${tile.bg} rounded-xl aspect-square flex flex-col items-center justify-center text-center p-md`}
                >
                  <span
                    className={`material-symbols-outlined text-4xl mb-sm ${tile.color}`}
                  >
                    {tile.icon}
                  </span>
                  <span className={`text-label-md font-semibold ${tile.color}`}>
                    {tile.label}
                  </span>
                </motion.div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <CTASection
        dark
        title="Ready to schedule?"
        subtitle="Get priority booking and a detailed consultation session with Dr. Zaid Gul."
        primaryLabel="Book Online"
        secondaryLabel="Download Guide (PDF)"
        secondaryHref={doctor.contact.whatsapp}
      />
    </main>
  );
}
