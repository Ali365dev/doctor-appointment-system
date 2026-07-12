"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { doctor } from "@/lib/data";
import CTASection from "@/components/public/CTASection";
import Reveal from "@/components/common/Reveal";
import RevealGroup, { revealItem } from "@/components/common/RevealGroup";
import AnimatedCounter from "@/components/common/AnimatedCounter";

const TIMELINE = [
  {
    role: "Senior Consultant Gastroenterologist",
    place: "Faisal Hospital, Faisalabad",
    period: "2021 — Present",
    detail:
      "Leading the GI endoscopy unit and managing complex hepatobiliary disease cases with state-of-the-art interventional procedures.",
    side: "left",
  },
  {
    role: "Fellow in Gastroenterology & Hepatology",
    place: "Shaheed Zulfiqar Ali Bhutto Medical University",
    period: "2018 — 2021",
    detail:
      "Completed post-graduate specialty training in clinical hepatology, interventional endoscopy, and inflammatory bowel disease management.",
    side: "right",
  },
  {
    role: "Medical Officer (Internal Medicine)",
    place: "Independent Medical College, Faisalabad",
    period: "2014 — 2018",
    detail:
      "Foundational clinical training encompassing general medicine, acute care management, and diagnostic gastroscopy.",
    side: "left",
  },
];

const MEMBERSHIP_CARDS = [
  {
    bg: "bg-surface-container-lowest text-on-background",
    icon: "account_balance",
    iconColor: "text-primary-container",
    title: "Royal College of Physicians (UK)",
    desc: "Actively participating in continuing medical education and clinical standard development.",
    span: "md:col-span-2",
  },
  {
    bg: "bg-primary-container text-on-primary",
    icon: "medical_services",
    iconColor: "",
    title: "PMC Registered",
    desc: "PAKISTAN MEDICAL COMMISSION",
    isCaption: true,
    span: "",
  },
  {
    bg: "bg-secondary-container text-on-secondary-container",
    icon: "monitoring",
    iconColor: "",
    title: "MRCP Affiliated",
    desc: "ROYAL COLLEGE OF PHYSICIANS",
    isCaption: true,
    span: "",
  },
];

export default function AboutContent() {
  const {
    name, qualifications, experience_years, rating, profile_image,
    education, professional_memberships, about, specialization, verification,
  } = doctor;

  return (
    <main className="pt-24 overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="py-xl px-gutter max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center">
          {/* Portrait */}
          <Reveal className="lg:col-span-5 relative group">
            <div className="absolute inset-0 bg-primary/10 rounded-xl translate-x-4 translate-y-4 -z-10 transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
            <motion.div
              className="relative rounded-xl overflow-hidden aspect-4/5 border border-outline-variant/20 shadow-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={profile_image}
                alt={name}
                fill
                className="object-cover object-top"
                unoptimized
                priority
              />
            </motion.div>
          </Reveal>

          {/* Text */}
          <Reveal delay={150} className="lg:col-span-7 space-y-md">
            <div className="inline-flex items-center gap-xs bg-secondary-fixed text-on-secondary-fixed px-sm py-1 rounded-full">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="text-label-md font-semibold uppercase tracking-wider">
                {verification}
              </span>
            </div>

            <h1 className="text-display font-bold leading-[1.1] tracking-[-0.02em] text-on-background">
              Compassionate Care Through{" "}
              <span
                className="bg-gradient-to-r from-primary to-secondary bg-clip-text"
                style={{ WebkitTextFillColor: "transparent" }}
              >
                Clinical Precision.
              </span>
            </h1>

            <p className="text-body-lg text-on-surface-variant max-w-2xl">
              {name} is a highly distinguished Specialist{" "}
              {specialization.join(" & ")} dedicated to providing advanced
              diagnostic and therapeutic solutions for complex digestive health
              issues.
            </p>

            <RevealGroup className="grid grid-cols-2 md:grid-cols-3 gap-md pt-md">
              <motion.div variants={revealItem} className="space-y-1">
                <span className="text-headline-md font-semibold text-primary">
                  <AnimatedCounter value={experience_years} suffix="+ Years" />
                </span>
                <p className="text-caption text-outline uppercase tracking-widest">
                  Clinical Experience
                </p>
              </motion.div>
              <motion.div variants={revealItem} className="space-y-1">
                <span className="text-headline-md font-semibold text-primary">
                  <AnimatedCounter value={rating.score} decimals={1} suffix="/5" />
                </span>
                <p className="text-caption text-outline uppercase tracking-widest">
                  Patient Rating
                </p>
              </motion.div>
              <motion.div variants={revealItem} className="space-y-1">
                <span className="text-headline-md font-semibold text-primary">
                  <AnimatedCounter value={5} suffix="k+" />
                </span>
                <p className="text-caption text-outline uppercase tracking-widest">
                  Successful Procedures
                </p>
              </motion.div>
            </RevealGroup>

            <div className="flex flex-wrap gap-sm pt-md">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/book-appointment/step-1"
                  className="block bg-primary text-on-primary px-lg py-sm rounded-xl text-label-md font-semibold hover:opacity-90 transition-colors shadow-lg"
                >
                  Book Consultation
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/services"
                  className="block border border-outline-variant text-on-surface px-lg py-sm rounded-xl text-label-md font-semibold hover:bg-surface-container transition-colors"
                >
                  View Services
                </Link>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Philosophy of Care ── */}
      <section className="bg-surface-container-low py-xl">
        <div className="max-w-[1280px] mx-auto px-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
            {/* Bio */}
            <Reveal className="lg:col-span-2 space-y-md">
              <h2 className="text-headline-lg font-bold text-on-surface">
                Philosophy of Care
              </h2>
              <div className="space-y-sm text-body-lg text-on-surface-variant leading-relaxed">
                <p className="italic border-l-4 border-primary pl-md">
                  &ldquo;My approach to gastroenterology is rooted in the belief
                  that every patient deserves a precise diagnosis paired with a
                  personalized care plan. Medical excellence isn&apos;t just
                  about technical skill — it&apos;s about listening to the
                  nuances of a patient&apos;s experience to uncover the root
                  cause of their discomfort.&rdquo;
                </p>
                <p>
                  {about} — a leading specialist in gastroenterology and
                  hepatology. His practice integrates the latest evidence-based
                  research with a patient-first ethos, ensuring that treatment
                  is both effective and empathetic.
                </p>
              </div>

              <RevealGroup className="pt-md grid grid-cols-1 sm:grid-cols-2 gap-md">
                <motion.div
                  variants={revealItem}
                  whileHover={{ y: -4 }}
                  className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/10 shadow-sm"
                >
                  <span className="material-symbols-outlined text-primary mb-xs block">
                    clinical_notes
                  </span>
                  <h3 className="text-headline-md font-semibold mb-xs">
                    Diagnostic Excellence
                  </h3>
                  <p className="text-on-surface-variant text-body-md">
                    Utilizing state-of-the-art imaging and laboratory
                    diagnostics for early detection.
                  </p>
                </motion.div>
                <motion.div
                  variants={revealItem}
                  whileHover={{ y: -4 }}
                  className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/10 shadow-sm"
                >
                  <span className="material-symbols-outlined text-primary mb-xs block">
                    neurology
                  </span>
                  <h3 className="text-headline-md font-semibold mb-xs">
                    Personalized Protocol
                  </h3>
                  <p className="text-on-surface-variant text-body-md">
                    Tailored dietary and medicinal strategies that respect
                    individual lifestyle factors.
                  </p>
                </motion.div>
              </RevealGroup>
            </Reveal>

            {/* Credentials Sidebar */}
            <Reveal delay={200} className="space-y-lg">
              <div className="bg-surface-container-highest p-lg rounded-xl">
                <h3 className="text-label-md font-semibold text-outline uppercase tracking-[0.2em] mb-md">
                  Qualifications
                </h3>
                <ul className="space-y-md">
                  {education.map((edu) => (
                    <li key={edu.degree} className="flex gap-sm">
                      <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          school
                        </span>
                      </div>
                      <div>
                        <p className="text-headline-md font-semibold text-on-surface leading-tight">
                          {edu.degree}
                        </p>
                        {edu.institute && (
                          <p className="text-caption text-outline">
                            {edu.institute}
                            {edu.year ? ` · ${edu.year}` : ""}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Professional Memberships mini */}
              <div className="bg-surface-container-highest p-lg rounded-xl">
                <h3 className="text-label-md font-semibold text-outline uppercase tracking-[0.2em] mb-md">
                  Memberships
                </h3>
                <ul className="space-y-sm">
                  {professional_memberships.map((m) => (
                    <li key={m} className="flex gap-sm items-start">
                      <div className="h-8 w-8 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center mt-0.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          workspace_premium
                        </span>
                      </div>
                      <p className="text-body-md text-on-surface">{m}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Professional Journey Timeline ── */}
      <section className="py-xl px-gutter max-w-[1280px] mx-auto">
        <Reveal className="text-center mb-xl">
          <h2 className="text-headline-lg font-bold text-on-surface">
            Professional Journey
          </h2>
        </Reveal>
        <div className="relative max-w-4xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant/50 hidden md:block" />

          <div className="space-y-xl">
            {TIMELINE.map((item, i) => (
              <Reveal
                key={i}
                delay={i * 150}
                className={`flex flex-col md:flex-row items-center gap-md relative ${
                  item.side === "right" ? "md:flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`md:w-1/2 ${
                    item.side === "left" ? "md:text-right md:pr-lg" : "md:pl-lg"
                  }`}
                >
                  <h4 className="text-headline-md font-semibold text-primary">
                    {item.role}
                  </h4>
                  <p className="text-body-md font-semibold text-on-surface">
                    {item.place}
                  </p>
                  <p className="text-on-surface-variant italic">{item.period}</p>
                </div>
                <motion.div
                  className="h-4 w-4 rounded-full bg-primary ring-4 ring-primary-fixed z-10 hidden md:block shrink-0"
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
                <div
                  className={`md:w-1/2 text-on-surface-variant ${
                    item.side === "left" ? "md:pl-lg" : "md:text-right md:pr-lg"
                  }`}
                >
                  {item.detail}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Professional Memberships Bento ── */}
      <section className="bg-primary py-xl text-on-primary overflow-hidden relative">
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none hidden md:block">
          <div className="flex h-full">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-on-primary" />
            ))}
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-gutter relative z-10">
          <Reveal className="flex flex-col md:flex-row justify-between items-end mb-xl gap-md">
            <div>
              <span className="text-label-md font-semibold uppercase tracking-widest text-primary-fixed">
                Network &amp; Affiliations
              </span>
              <h2 className="text-headline-lg font-bold mt-xs">
                Professional Memberships
              </h2>
            </div>
            <p className="max-w-md text-primary-fixed-dim text-body-md">
              Active contributor and member of renowned medical institutions
              ensuring global standards in local patient care.
            </p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 md:grid-cols-4 gap-md">
            {MEMBERSHIP_CARDS.map((card, i) => (
              <motion.div
                key={i}
                variants={revealItem}
                whileHover={{ y: -4 }}
                className={`${card.bg} p-lg rounded-xl ${card.span}`}
              >
                <span
                  className={`material-symbols-outlined text-4xl mb-md block ${card.iconColor}`}
                >
                  {card.icon}
                </span>
                <h4 className="text-headline-md font-semibold mb-xs">
                  {card.title}
                </h4>
                {card.isCaption ? (
                  <p className="text-caption opacity-80 uppercase tracking-widest">
                    {card.desc}
                  </p>
                ) : (
                  <p className="text-body-md opacity-80">{card.desc}</p>
                )}
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── CTA ── */}
      <CTASection
        title="Ready to Prioritize Your Digestive Health?"
        subtitle="Schedule a consultation with Dr. Zaid Gul to discuss your symptoms and start your journey towards improved health."
        primaryLabel="Book Your Appointment"
        secondaryLabel="Contact Office"
      />
    </main>
  );
}
