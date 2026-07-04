import Image from "next/image";
import Link from "next/link";
import { doctor } from "@/lib/data";
import HeroBookingForm from "@/components/home/HeroBookingForm";
import PracticeLocations from "@/components/home/PracticeLocations";
import ReviewsCarousel from "@/components/common/ReviewsCarousel";

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
  const { name, qualifications, experience_years, rating, profile_image, contact, education,
    professional_memberships, services, conditions_treated, treatments_offered, about } = doctor;

  const firstName = name.split(" ")[0];
  const displayName = name;
  const specializations = doctor.specialization.join(" & ");
  const whatsappLink = contact.whatsapp;
  const helpline = contact.helpline;

  return (
    <main className="pt-24 overflow-x-hidden">
      {/* ── Hero ── */}
      <section
        id="hero"
        className="relative min-h-[90vh] flex items-center px-gutter py-xl max-w-[1280px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center w-full">
          {/* Left: Profile */}
          <div className="lg:col-span-7 space-y-md">
            {/* Verification badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dbe1ff] text-[#00174b] text-caption font-bold">
              <span
                className="material-symbols-outlined text-caption"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              {doctor.verification}
            </div>

            <h1 className="text-display font-bold leading-[1.1] tracking-[-0.02em] text-on-surface">
              {displayName}
            </h1>

            <p className="text-headline-md font-semibold text-secondary leading-tight">
              {qualifications}
            </p>

            <p className="text-body-lg text-on-surface-variant max-w-md">
              {specializations}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-md py-sm">
              <div className="flex items-center gap-xs">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">work_history</span>
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">{experience_years}+ Years</p>
                  <p className="text-caption text-on-surface-variant">Experience</p>
                </div>
              </div>
              <div className="flex items-center gap-xs">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">{rating.score} Rating</p>
                  <p className="text-caption text-on-surface-variant">{rating.satisfaction_percent}% Satisfied</p>
                </div>
              </div>
              <div className="flex items-center gap-xs">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">reviews</span>
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">{rating.reviews_count}+</p>
                  <p className="text-caption text-on-surface-variant">Patient Reviews</p>
                </div>
              </div>
            </div>

            {/* Thumb + bio */}
            <div className="flex items-center gap-4 pt-sm">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white shrink-0">
                <Image
                  src={profile_image}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <p className="text-body-lg text-on-surface-variant max-w-md leading-relaxed">
                Dedicated to providing high-quality medical care for gastrointestinal and liver
                disorders with a patient-centric approach.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-sm pt-md">
              <Link
                href="#booking"
                className="bg-primary text-on-primary px-lg py-sm rounded-xl text-label-md font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined text-label-md">calendar_month</span>
                Book Appointment
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-container-highest text-on-surface px-lg py-sm rounded-xl text-label-md font-semibold flex items-center gap-2 hover:bg-surface-dim transition-colors"
              >
                <span className="material-symbols-outlined text-label-md">chat</span>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-5 relative" id="booking">
            <div className="absolute -z-10 -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-12 -left-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
            <HeroBookingForm />
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="bg-surface-container-low py-xl px-gutter overflow-hidden">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          {/* Portrait */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <Image
                src={profile_image}
                alt={`${displayName} Portrait`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full z-0" />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/10 rounded-full z-0" />
            <div className="absolute bottom-6 left-6 glass-card p-sm rounded-xl z-20 shadow-lg border border-white/30">
              <p className="text-headline-md font-semibold text-primary">{rating.reviews_count}+</p>
              <p className="text-caption text-on-surface-variant">Verified Reviews</p>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-md">
            <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
              About {displayName}
            </h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              {about} — a leading specialist in gastroenterology and hepatology with {experience_years}+ years
              of clinical excellence. Committed to patient-centric care for digestive and liver disorders.
            </p>

            {/* Education */}
            {education.length > 0 && (
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-1">school</span>
                <div>
                  <h4 className="text-label-md font-semibold text-on-surface">Academic Qualifications</h4>
                  <ul className="text-on-surface-variant text-body-md list-disc list-inside mt-xs space-y-xs">
                    {education.map((edu) => (
                      <li key={edu.degree}>
                        {edu.degree}
                        {edu.institute ? ` — ${edu.institute}` : ""}
                        {edu.year ? ` (${edu.year})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Memberships */}
            {professional_memberships.length > 0 && (
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-1">workspace_premium</span>
                <div>
                  <h4 className="text-label-md font-semibold text-on-surface">
                    Professional Memberships
                  </h4>
                  <ul className="text-on-surface-variant text-body-md list-disc list-inside mt-xs space-y-xs">
                    {professional_memberships.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

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
            {services.map((s) => (
              <div
                key={s}
                className="p-md rounded-2xl bg-surface hover:shadow-xl hover:-translate-y-1 transition-all border border-outline-variant/30 group flex flex-col"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-sm group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                  <span className="material-symbols-outlined text-3xl">{getServiceIcon(s)}</span>
                </div>
                <h3 className="text-label-md font-semibold text-on-surface">{s}</h3>
                <p className="text-caption text-on-surface-variant mt-xs line-clamp-2 flex-1">{getServiceDesc(s)}</p>
              </div>
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
        <div className="bg-primary rounded-4xl p-lg text-on-primary flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src={CTA_BG} alt="" fill className="object-cover" />
          </div>

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
            <Link
              href="#hero"
              className="  bg-on-primary text-primary px-lg py-sm rounded-xl font-bold text-center hover:bg-on-primary/90 transition-all"
            >
              Book Online
            </Link>
            <Link
              href="/book-appointment/step-1?visitType=online"
              className="bg-on-primary/10 border-2 border-on-primary/40 text-on-primary px-lg py-sm rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-on-primary/20 transition-all"
            >
              Video Consultation
            </Link>
            <a
              href={`tel:${helpline}`}
              className="border-2 border-on-primary/30 text-on-primary px-lg py-sm rounded-xl font-bold text-center hover:bg-on-primary/10 transition-all"
            >
              Call helpline
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
