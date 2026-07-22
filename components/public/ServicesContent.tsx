"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import ProcedureCard, { type Procedure } from "@/components/public/ProcedureCard";
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
  {
    icon: "verified_user",
    label: "Certified Safety",
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: "medical_information",
    label: "Detailed Reports",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: "psychology",
    label: "Expert Insight",
    image: "https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: "support_agent",
    label: "24/7 Support",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800&auto=format&fit=crop",
  },
];

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD8Fl9bfESyniMxUDMxazH5L5msPPi4PznZ2TzyyUg_pNYKZMY-R57isUNVA5Q9khwloJZY0KzdJHYYre6wsjbKwPpUt2pWRGb63nvLUv095thZFZiilpxMVeUSZP520ZWck58M7G22JiwDG8GIey9sRd0VwrfxesVpyp1qUKL8bC3IEErtQtL03m10SJLs0S9qlqel0N4jR3WstiS8zq9dmTuEWefr0O7FgBtm9JU4enmB9WSmwm4ZLYAniLKu1hFwkpHxFoq7e-Y";

export default function ServicesContent({ procedures }: { procedures: Procedure[] }) {
  const doctor = useDoctorProfile();
  // Most specialized (highest price) shown first
  const sorted = [...procedures].sort((a, b) => b.pricePkr - a.pricePkr);

  async function downloadPreparationGuide() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    const HEADER_H = 32;

    // Same brand header/footer treatment as the admin Reports PDF export, so
    // every doctor-branded PDF in the app looks consistent.
    const NAVY: [number, number, number] = [10, 36, 71];
    const NAVY_LIGHT: [number, number, number] = [24, 60, 105];
    const TEXT_DARK: [number, number, number] = [24, 28, 38];
    const TEXT_MUTED: [number, number, number] = [110, 114, 130];
    const CARD_BORDER: [number, number, number] = [226, 230, 238];

    const generatedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    const initials = doctor.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "DR";

    function drawHeader() {
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, pageWidth, HEADER_H, "F");
      doc.setFillColor(...NAVY_LIGHT);
      doc.triangle(pageWidth * 0.62, HEADER_H, pageWidth, HEADER_H, pageWidth, HEADER_H * 0.25, "F");

      doc.setFillColor(255, 255, 255);
      doc.circle(margin + 8, HEADER_H / 2, 8, "F");
      doc.setTextColor(...NAVY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(initials, margin + 8, HEADER_H / 2 + 1.5, { align: "center" });

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(doctor.name, margin + 20, HEADER_H / 2 - 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(doctor.designation, margin + 20, HEADER_H / 2 + 1.5);
      doc.setFontSize(8);
      doc.text([doctor.contactPhone, doctor.contactEmail].filter(Boolean).join("   ·   "), margin + 20, HEADER_H / 2 + 7);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Preparation Guide", pageWidth - margin, HEADER_H / 2 - 3, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Generated: ${generatedAt}`, pageWidth - margin, HEADER_H / 2 + 4, { align: "right" });

      doc.setTextColor(...TEXT_DARK);
    }

    function drawFooter() {
      doc.setDrawColor(...CARD_BORDER);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...TEXT_MUTED);
      doc.text("Confidential — for internal clinical use only", margin, pageHeight - 7);
      doc.text("Page 1 of 1", pageWidth - margin, pageHeight - 7, { align: "right" });
    }

    drawHeader();

    let y = HEADER_H + 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...NAVY);
    doc.text("Procedure Preparation Guide", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Please follow these clinical protocols carefully prior to your appointment.", margin, y);
    doc.setDrawColor(...CARD_BORDER);
    doc.line(margin, y + 4, pageWidth - margin, y + 4);
    doc.setTextColor(...TEXT_DARK);
    y += 14;

    for (const step of PREP_STEPS) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12.5);
      doc.setTextColor(...NAVY);
      doc.text(`${step.num}.  ${step.title}`, margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...TEXT_DARK);
      const lines = doc.splitTextToSize(step.body, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5.5 + 9;
    }

    drawFooter();
    doc.save("preparation-guide.pdf");
  }

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

              </div>
            </Reveal>
            <motion.div
              className="w-full md:w-1/2 relative h-100"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0, margin: "0px 0px -10% 0px" }}
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
                key={t.id}
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
                  className="relative rounded-xl aspect-square overflow-hidden flex flex-col items-center justify-center text-center p-md"
                >
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/55" />
                  <span className="material-symbols-outlined text-4xl mb-sm text-white relative z-10">
                    {tile.icon}
                  </span>
                  <span className="text-label-md font-semibold text-white relative z-10">
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
        onSecondaryClick={downloadPreparationGuide}
      />
    </main>
  );
}
