"use client";

import Image from "next/image";
import Link from "next/link";
import { doctor as staticDoctor, buildWhatsappLink } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import HeroBookingForm from "@/components/home/HeroBookingForm";
import PracticeLocations from "@/components/home/PracticeLocations";
import ReviewsCarousel from "@/components/common/ReviewsCarousel";
import Reveal from "@/components/common/Reveal";
import RevealGroup, { revealItem } from "@/components/common/RevealGroup";
import AnimatedCounter from "@/components/common/AnimatedCounter";
import TypewriterText from "@/components/common/TypewriterText";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const MotionLink = motion.create(Link);

const CTA_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuATKh7hiy8TZrlatl7coiegFfTo9HoAC_1jitGOsiq5J1XrA4zgq0Df73ZwzgcXbLWSPgM0tWxJeO3K9C6bbchiiQAwLcvyrseEcx5z8zk2tuQT3lGRUttFCqj04J2nYFojMNsGTKNvtGq0MDY84W8UvOJVGBsv1cjWhAdyp6BF0qaZ8XdI5eQgSZ9g5fDUur3abZI9gvJ_J7AjgWQSjKVdt3kUL97F-Dh5DuWf5Pif9UT5HkHhIaDaSJLiIpcnmELrjWu7W6bhHIc";


const SERVICE_ICONS: Record<string, string> = {
  Biopsy: "biotech",
  Colonoscopy: "visibility",
  "Constipation Treatment": "healing",
  "Diarrhea Treatment": "medication",
  "Digital Rectal Examination": "monitor_heart",
  Endoscopist: "stethoscope",
  // "microscope" is not in Material Symbols; replaced with "search" (visual examination)
  Endoscopy: "search",
  Gastroscopy: "emergency",
  "Hepatitis A Treatment": "vaccines",
  "Hepatitis B Treatment": "vaccines",
  "Hepatitis C Treatment": "vaccines",
  Oesophagoscopy: "vital_signs",
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  Biopsy: "Tissue sample collection for accurate diagnosis.",
  Colonoscopy: "Examination of the colon to detect digestive disorders.",
  "Constipation Treatment": "Diagnosis and treatment for chronic constipation.",
  "Diarrhea Treatment": "Effective care for acute and chronic diarrhea.",
  "Digital Rectal Examination": "Physical examination to assess rectal health.",
  Endoscopist: "Specialist consultation for gastrointestinal diseases.",
  Endoscopy: "Minimally invasive procedure to examine the digestive tract.",
  Gastroscopy: "Examination of the stomach and upper digestive system.",
  "Hepatitis A Treatment": "Medical management of Hepatitis A infection.",
  "Hepatitis B Treatment": "Comprehensive treatment for Hepatitis B.",
  "Hepatitis C Treatment": "Advanced treatment for Hepatitis C infection.",
  Oesophagoscopy: "Examination of the esophagus using an endoscope.",
};

const getServiceIcon = (name: string) =>
  SERVICE_ICONS[name] ??
  Object.entries(SERVICE_ICONS).find(([k]) => name.toLowerCase().includes(k.toLowerCase()))?.[1] ??
  "medical_services";

const getServiceDesc = (name: string) =>
  SERVICE_DESCRIPTIONS[name] ??
  Object.entries(SERVICE_DESCRIPTIONS).find(([k]) => name.toLowerCase().includes(k.toLowerCase()))?.[1] ??
  "";

export default function HomePage() {
  const {
    name,
    experienceYears,
    profileImage,
    education,
    professionalMemberships,
    about,
    contactWhatsapp,
    contactPhone,
    specialization,
    verification,
    whyChooseSubtitle,
    whyChooseFeatures,
    careGalleryTitle,
    careGallerySubtitle,
    careGalleryImages,
  } = useDoctorProfile();
  const { rating, services, conditions_treated, treatments_offered } = staticDoctor;
  const qualifications = education.map((edu) => edu.name).join(", ");

  const firstName = name.split(" ")[0];
  const displayName = name;
  const specializations = specialization.join(" & ");
  const whatsappLink = buildWhatsappLink(contactWhatsapp);
  const featuredConditions = conditions_treated.slice(0, 14);
  const moreConditionsCount = Math.max(0, conditions_treated.length - featuredConditions.length);

  // Sequential hero reveal: name types out first, then each block below it
  // fades in one after another so the page doesn't dump everything at once.
  const typeEnd = 0.3 + displayName.length * 0.045;
  const heroTiming = {
    qualifications: typeEnd + 0.15,
    specializations: typeEnd + 0.3,
    stats: typeEnd + 0.45,
    thumb: typeEnd + 0.75,
    cta: typeEnd + 0.95,
    booking: typeEnd + 0.5,
  };

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const blobYTop = useTransform(heroScroll, [0, 1], [0, 120]);
  const blobYBottom = useTransform(heroScroll, [0, 1], [0, -80]);

  return (
    <main className="pt-24 overflow-x-hidden relative">
      {/* ── Hero ── */}
      <section
        ref={heroRef}
        id="hero"
        className="relative min-h-[90vh] flex items-center px-gutter py-xl max-w-[1280px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center w-full">
          {/* Left: Profile */}
          <motion.div
            className="lg:col-span-7 space-y-md"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Verification badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dbe1ff] text-[#00174b] text-caption font-bold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span
                className="material-symbols-outlined text-caption"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              {verification}
            </motion.div>

            <h1 className="text-display font-bold leading-[1.1] tracking-[-0.02em] text-on-surface min-h-[1.1em]">
              <TypewriterText text={displayName} delay={0.3} />
            </h1>

            <motion.p
              className="text-headline-md font-semibold text-secondary leading-tight"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: heroTiming.qualifications }}
            >
              {qualifications}
            </motion.p>

            <motion.p
              className="text-body-lg text-on-surface-variant max-w-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: heroTiming.specializations }}
            >
              {specializations}
            </motion.p>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-md py-sm"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { delayChildren: heroTiming.stats, staggerChildren: 0.15 } } }}
            >
              <motion.div variants={revealItem} whileHover={{ y: -3 }} className="flex items-center gap-xs">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">work_history</span>
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">
                    <AnimatedCounter value={experienceYears} suffix="+ Years" />
                  </p>
                  <p className="text-caption text-on-surface-variant">Experience</p>
                </div>
              </motion.div>
              <motion.div variants={revealItem} whileHover={{ y: -3 }} className="flex items-center gap-xs">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">
                    <AnimatedCounter value={rating.score} decimals={1} suffix=" Rating" />
                  </p>
                  <p className="text-caption text-on-surface-variant">{rating.satisfaction_percent}% Satisfied</p>
                </div>
              </motion.div>
              <motion.div variants={revealItem} whileHover={{ y: -3 }} className="flex items-center gap-xs">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">reviews</span>
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">
                    <AnimatedCounter value={rating.reviews_count} suffix="+" />
                  </p>
                  <p className="text-caption text-on-surface-variant">Patient Reviews</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Thumb + bio */}
            <motion.div
              className="flex items-center gap-4 pt-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: heroTiming.thumb }}
            >
              <motion.div
                className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white shrink-0"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src={profileImage}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </motion.div>
              <p className="text-body-lg text-on-surface-variant max-w-md leading-relaxed">
                Dedicated to providing high-quality medical care for gastrointestinal and liver
                disorders with a patient-centric approach.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap gap-sm pt-md"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: heroTiming.cta, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <MotionLink
                href="#booking"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-primary text-on-primary px-lg py-sm rounded-xl text-label-md font-semibold flex items-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-label-md">calendar_month</span>
                Book Appointment
              </MotionLink>
              <motion.a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-surface-container-highest text-on-surface px-lg py-sm rounded-xl text-label-md font-semibold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-label-md">chat</span>
                WhatsApp
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right: Booking Card */}
          <motion.div
            className="lg:col-span-5 relative"
            id="booking"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: heroTiming.booking, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              style={{ y: blobYTop }}
              className="absolute -z-10 -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            />
            <motion.div
              style={{ y: blobYBottom }}
              className="absolute -z-10 -bottom-12 -left-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"
            />
            <HeroBookingForm />
          </motion.div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="bg-surface-container-low py-xl px-gutter overflow-hidden">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          {/* Portrait */}
          <Reveal className="relative order-2 lg:order-1">
            <motion.div
              className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={profileImage}
                alt={`${displayName} Portrait`}
                fill
                className="object-cover"
                unoptimized
              />
            </motion.div>
            <motion.div
              className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full z-0"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/10 rounded-full z-0"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute bottom-6 left-6 glass-card p-sm rounded-xl z-20 shadow-lg border border-white/30">
              <p className="text-headline-md font-semibold text-primary">{rating.reviews_count}+</p>
              <p className="text-caption text-on-surface-variant">Verified Reviews</p>
            </div>
          </Reveal>

          {/* Text */}
          <Reveal delay={300} className="order-1 lg:order-2 space-y-md">
            <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
              About {displayName}
            </h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              {about} — a leading specialist in gastroenterology and hepatology with {experienceYears}+ years
              of clinical excellence. Committed to patient-centric care for digestive and liver disorders.
            </p>

            {/* Education */}
            {education.length > 0 && (
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-1">school</span>
                <div>
                  <h4 className="text-label-md font-semibold text-on-surface">Academic Qualifications</h4>
                  <ul className="text-on-surface-variant text-body-md list-disc list-inside mt-xs space-y-xs">
                    {education.map((edu, i) => (
                      <li key={`${edu.name}-${i}`}>
                        {edu.name}
                        {edu.institute ? ` — ${edu.institute}` : ""}
                        {edu.year ? ` (${edu.year})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Memberships */}
            {professionalMemberships.length > 0 && (
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-1">workspace_premium</span>
                <div>
                  <h4 className="text-label-md font-semibold text-on-surface">
                    Professional Memberships
                  </h4>
                  <ul className="text-on-surface-variant text-body-md list-disc list-inside mt-xs space-y-xs">
                    {professionalMemberships.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-xl px-gutter max-w-[1280px] mx-auto">
        <Reveal className="text-center mb-xl">
          <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
            Why Choose {displayName}?
          </h2>
          <p className="text-on-surface-variant mt-xs max-w-xl mx-auto">
            {whyChooseSubtitle || "Setting new benchmarks in gastrointestinal health through expertise and empathy."}
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {whyChooseFeatures.map((f) => (
            <motion.div
              key={f.title}
              variants={revealItem}
              whileHover={{ y: -6 }}
              className="rounded-2xl bg-surface border border-outline-variant/30 shadow-sm overflow-hidden group"
            >
              <div className="relative h-36 overflow-hidden">
                <motion.div className="absolute inset-0" whileHover={{ scale: 1.08 }} transition={{ duration: 0.4 }}>
                  <Image src={f.image} alt={f.title} fill className="object-cover" unoptimized />
                </motion.div>
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 w-11 h-11 rounded-xl bg-surface/90 backdrop-blur-sm text-primary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
              </div>
              <div className="p-md">
                <p className="text-label-md font-bold text-on-surface">{f.title}</p>
                <p className="text-caption text-on-surface-variant mt-xs">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </RevealGroup>
      </section>

      {/* ── Care & Facility Gallery ── */}
      <section className="py-xl px-gutter max-w-[1280px] mx-auto">
        <Reveal className="text-center mb-xl">
          <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
            {careGalleryTitle || "Care You Can See"}
          </h2>
          <p className="text-on-surface-variant mt-xs max-w-xl mx-auto">
            {careGallerySubtitle || "A calm, modern environment designed around patient comfort."}
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-md h-105 md:h-120">
          {careGalleryImages.map((img, i) => (
            <motion.div
              key={img.image}
              className={`relative rounded-3xl overflow-hidden shadow-md group ${i === 0 ? "col-span-1 row-span-2" : ""}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.25 }}
              whileHover={{ scale: 1.02 }}
            >
              <Image src={img.image} alt={img.label || "Clinic photo"} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.p
                className="absolute bottom-4 left-4 text-white font-semibold text-label-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
              >
                {img.label}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Conditions Treated ── */}
      {featuredConditions.length > 0 && (
        <section className="py-xl px-gutter max-w-[1280px] mx-auto">
          <Reveal className="text-center mb-xl">
            <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
              Conditions We Treat
            </h2>
            <p className="text-on-surface-variant mt-xs max-w-xl mx-auto">
              From common digestive complaints to complex liver disorders.
            </p>
          </Reveal>

          <RevealGroup className="flex flex-wrap justify-center gap-xs">
            {featuredConditions.map((c) => (
              <motion.span
                key={c}
                variants={revealItem}
                whileHover={{ scale: 1.05 }}
                className="px-md py-xs rounded-full bg-surface-container text-label-md font-medium text-on-surface border border-outline-variant/30"
              >
                {c}
              </motion.span>
            ))}
         
          </RevealGroup>
        </section>
      )}

      {/* ── Services ── */}
      {services.length > 0 && (
        <section id="services" className="py-xl px-gutter max-w-[1280px] mx-auto">
          <div className="text-center mb-xl">
            <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
              Specialized Services
            </h2>
            <p className="text-on-surface-variant mt-xs max-w-xl mx-auto">
              Comprehensive care for all digestive health issues using state-of-the-art diagnostic and
              therapeutic techniques.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md">
            {services.map((s, i) => (
              <Reveal key={s} delay={(i % 4) * 150}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="p-md rounded-2xl bg-surface hover:shadow-xl transition-shadow border border-outline-variant/30 group flex flex-col h-full"
                >
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.1 }}
                    className="w-14 h-14 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-sm group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-3xl">{getServiceIcon(s)}</span>
                  </motion.div>
                  <h3 className="text-label-md font-semibold text-on-surface">{s}</h3>
                  <p className="text-caption text-on-surface-variant mt-xs line-clamp-2 flex-1">{getServiceDesc(s)}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Practice Locations ── */}
      <PracticeLocations />

   
 

      {/* ── Reviews ── */}
      <ReviewsCarousel />

      {/* ── CTA ── */}
      <section className="py-xl px-gutter max-w-[1280px] mx-auto mb-xl">
        <Reveal className="bg-primary rounded-4xl p-lg text-on-primary flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-10 pointer-events-none"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image src={CTA_BG} alt="" fill className="object-cover" />
          </motion.div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-headline-lg font-bold leading-[1.2] mb-sm">
              Ready to improve your digestive health?
            </h2>
            <p className="opacity-90">
              Schedule your consultation today and take the first step towards a healthier life.{" "}
              {firstName} and his team are here to help you.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-sm w-full md:w-auto">
            <MotionLink
              href="#hero"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-on-primary text-primary px-lg py-sm rounded-xl font-bold text-center"
            >
              Book Online
            </MotionLink>
            <MotionLink
              href="/book-appointment/step-1?visitType=online"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-on-primary/10 border-2 border-on-primary/40 text-on-primary px-lg py-sm rounded-xl font-bold text-center flex items-center justify-center gap-2"
            >
              Video Consultation
            </MotionLink>
            <motion.a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="border-2 border-on-primary/30 text-on-primary px-lg py-sm rounded-xl font-bold text-center"
            >
              WhatsApp
            </motion.a>
          </div>
        </Reveal>
      </section>

    </main>
  );
}
