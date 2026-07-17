"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { doctor as staticDoctor, buildWhatsappLink } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import Reveal from "@/components/common/Reveal";
import RevealGroup, { revealItem } from "@/components/common/RevealGroup";

interface Props {
  conditions: string[];
  services: string[];
}

const CONDITION_ICONS: Record<string, string> = {
  "Abdomen Pain": "personal_injury",
  "Abdominal Pain": "personal_injury",
  "Acid Peptic Disease": "medication",
  Anemia: "bloodtype",
  "Black Stools": "warning",
  Bloating: "water_drop",
  "Chronic Hepatitis": "vital_signs",
  Diarrhea: "waves",
  Dyspepsia: "restaurant",
  "Enteric Fever": "device_thermostat",
  Fatigue: "battery_low",
  Fever: "device_thermostat",
  Fissures: "cut",
  "Gastric Ulcer": "healing",
  Gastroenteritis: "sick",
  "GERD (Gastroesophageal Reflux Disease)": "relax",
  "Helicobacter Pylori Bacteria": "coronavirus",
  Hemorrhoids: "bloodtype",
  "Hepatitis B": "vaccines",
  "Hepatitis C": "vaccines",
  Jaundice: "wb_sunny",
  "Liver Diseases": "monitor_heart",
  "Pancreas Disease": "health_metrics",
  "Stomach pain": "personal_injury",
  "Typhoid Fever": "device_thermostat",
};

const CONDITION_DESCS: Record<string, string> = {
  "Abdomen Pain": "Chronic or acute pain management and diagnostics.",
  "Abdominal Pain": "Chronic or acute pain management and diagnostics.",
  "Acid Peptic Disease": "Treatment for ulcers and digestive acidity.",
  Anemia: "Evaluation and management of iron deficiency anemia.",
  "Black Stools": "Diagnostic investigation for gastrointestinal bleeding.",
  Bloating: "Diagnosis and relief for chronic bloating and distension.",
  "Chronic Hepatitis": "Long-term management of hepatitis B and C.",
  Diarrhea: "Effective care for acute and chronic diarrhea.",
  Dyspepsia: "Evaluation of persistent indigestion and stomach discomfort.",
  "Enteric Fever": "Clinical management of typhoid and paratyphoid fever.",
  Fatigue: "Assessment of fatigue linked to GI or liver disorders.",
  Fever: "Diagnosis of fever originating from digestive infections.",
  Fissures: "Treatment of anal fissures and related conditions.",
  "Gastric Ulcer": "Therapeutic management of stomach ulcers.",
  Gastroenteritis: "Acute care for stomach and intestinal inflammation.",
  "GERD (Gastroesophageal Reflux Disease)": "Specialized care for acid reflux disease.",
  "Helicobacter Pylori Bacteria": "Detection and eradication of H. pylori infection.",
  Hemorrhoids: "Non-surgical and surgical hemorrhoid management.",
  "Hepatitis B": "Antiviral treatment and long-term monitoring.",
  "Hepatitis C": "Advanced antiviral therapy for complete cure.",
  Jaundice: "Evaluation of liver function and bile duct disorders.",
  "Liver Diseases": "Hepatitis, fatty liver, and cirrhosis management.",
  "Pancreas Disease": "Acute and chronic pancreatic care pathways.",
  "Stomach pain": "Chronic or acute pain management and diagnostics.",
  "Typhoid Fever": "Antibiotic management and recovery support.",
};

const SERVICE_ICONS: Record<string, string> = {
  Biopsy: "biotech",
  Colonoscopy: "analytics",
  "Constipation Treatment": "healing",
  "Diarrhea Treatment": "waves",
  "Digital Rectal Examination": "monitor_heart",
  Endoscopist: "stethoscope",
  Endoscopy: "visibility",
  Gastroscopy: "emergency",
  "Hepatitis A Treatment": "vaccines",
  "Hepatitis B Treatment": "vaccines",
  "Hepatitis C Treatment": "vaccines",
  Oesophagoscopy: "vital_signs",
};

export default function ConditionsSearch({ conditions, services }: Props) {
  const doctor = useDoctorProfile();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const setClinic = useBookingStore((s) => s.setClinic);

  const handleBook = useCallback(() => {
    const loc = staticDoctor.practice_locations[0];
    setClinic({
      id: "loc-0",
      name: loc.name,
      address: loc.address,
      fee_pkr: loc.fee_pkr,
      timings: loc.timings as Record<string, string>,
    });
    router.push("/book-appointment/step-1");
  }, [setClinic, router]);

  const filteredConditions = useMemo(() => {
    if (!query.trim()) return conditions;
    const q = query.toLowerCase();
    return conditions.filter((c) => c.toLowerCase().includes(q));
  }, [conditions, query]);

  const filteredServices = useMemo(() => {
    if (!query.trim()) return services;
    const q = query.toLowerCase();
    return services.filter((s) => s.toLowerCase().includes(q));
  }, [services, query]);

  return (
    <>
      {/* Search */}
   <section className="px-gutter pb-xl">
  <div className="max-w-[1280px] mx-auto">
    <Reveal className="relative max-w-xl mx-auto -mt-8">
      <span
        className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline text-2xl"
      >
        search
      </span>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search treatments, conditions, or services..."
        className="
          w-full
          h-14
          rounded-full
          border border-outline-variant
          bg-surface-container-lowest
          pl-14
          pr-12
          shadow-lg
          outline-none
          transition-all
          focus:border-primary
          focus:ring-4
          focus:ring-primary/20
          text-body-md
        "
      />

      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </Reveal>
  </div>
</section>

      {/* Main canvas */}
      <section className="px-gutter pb-xl">
        <div className="max-w-[1280px] mx-auto">

          {/* Diagnostic Services Bento */}
          {filteredServices.length > 0 && (
            <div className="mb-xl mt-12">
              <Reveal className="flex items-center gap-xs mb-lg">
                <span className="material-symbols-outlined text-primary">biotech</span>
                <h2 className="text-headline-lg font-bold">
                  Diagnostic &amp; Procedural Services
                </h2>
              </Reveal>
              <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-md">
                {/* Featured: first service */}
                <motion.div
                  variants={revealItem}
                  whileHover={{ y: -4 }}
                  className="md:col-span-2 group bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-colors cursor-pointer relative overflow-hidden shadow-sm"
                >
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-md">
                      <span className="material-symbols-outlined">
                        {SERVICE_ICONS[filteredServices[0]] ?? "medical_services"}
                      </span>
                    </div>
                    <h3 className="text-headline-md font-semibold mb-sm">
                      {filteredServices[0]}
                    </h3>
                    <p className="text-body-md text-on-surface-variant max-w-md">
                      Comprehensive specialized procedure performed with advanced
                      technology for accurate diagnosis and effective treatment.
                    </p>
                    <ul className="mt-md space-y-2">
                      <li className="flex items-center gap-xs text-body-md text-primary">
                        <span className="material-symbols-outlined text-body-lg">check_circle</span>
                        Fast recovery
                      </li>
                      <li className="flex items-center gap-xs text-body-md text-primary">
                        <span className="material-symbols-outlined text-body-lg">check_circle</span>
                        High-definition imaging
                      </li>
                    </ul>
                  </div>
                  <div className="absolute right-0 bottom-0 w-48 h-48 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[192px]">medical_services</span>
                  </div>
                </motion.div>

                {/* Service cards 2 & 3 */}
                {filteredServices.slice(1, 3).map((s, i) => (
                  <motion.div
                    key={s}
                    variants={revealItem}
                    whileHover={{ y: -4 }}
                    className={`group bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-colors cursor-pointer shadow-sm ${
                      i === 1 ? "md:col-start-3" : ""
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-md ${
                        i === 0
                          ? "bg-secondary/10 text-secondary"
                          : "bg-tertiary/10 text-tertiary"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {SERVICE_ICONS[s] ?? "medical_services"}
                      </span>
                    </div>
                    <h3 className="text-headline-md font-semibold mb-sm">{s}</h3>
                    <p className="text-body-md text-on-surface-variant">
                      Precision procedure performed by a specialist using
                      state-of-the-art equipment.
                    </p>
                  </motion.div>
                ))}

                {/* Advanced Liver Imaging banner */}
                <motion.div
                  variants={revealItem}
                  className="md:col-span-2 bg-primary text-on-primary p-lg rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-lg"
                >
                  <div className="flex-1">
                    <h3 className="text-headline-md font-semibold mb-sm">
                      Advanced Liver Imaging
                    </h3>
                    <p className="text-body-md opacity-90 mb-md">
                      Utilizing non-invasive technology to assess liver health
                      and fibrosis levels without surgical intervention.
                    </p>
                    <motion.div className="inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        href="/services"
                        className="block bg-surface text-primary text-label-md font-semibold px-md py-xs rounded-xl hover:bg-surface-container transition-colors"
                      >
                        View Procedures
                      </Link>
                    </motion.div>
                  </div>
                  <div className="w-full md:w-1/3 aspect-video bg-on-primary/10 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[64px] opacity-40">
                        monitor_heart
                      </span>
                    </div>
                  </div>
                </motion.div>
              </RevealGroup>
            </div>
          )}

          {/* Conditions Grid */}
          <div className="mb-xl">
            <Reveal className="flex items-center gap-xs mb-lg">
              <span className="material-symbols-outlined text-primary">healing</span>
              <h2 className="text-headline-lg font-bold">Conditions Treated</h2>
            </Reveal>

            {filteredConditions.length === 0 ? (
              <div className="text-center py-xl text-on-surface-variant">
                <span className="material-symbols-outlined text-display mb-md block text-outline">
                  search_off
                </span>
                <p className="text-body-lg">
                  No conditions found for &ldquo;{query}&rdquo;
                </p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-md text-primary font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                {filteredConditions.map((condition) => (
                  <motion.button
                    key={condition}
                    variants={revealItem}
                    whileHover={{ y: -4 }}
                    onClick={handleBook}
                    className="bg-surface-container-low p-md rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group text-left"
                  >
                    <span className="material-symbols-outlined text-secondary mb-sm group-hover:scale-110 transition-transform block">
                      {CONDITION_ICONS[condition] ?? "health_and_safety"}
                    </span>
                    <h4 className="text-body-lg font-semibold text-on-surface mb-xs">
                      {condition}
                    </h4>
                    <p className="text-caption text-on-surface-variant">
                      {CONDITION_DESCS[condition] ?? "Expert diagnosis and personalized treatment plan."}
                    </p>
                  </motion.button>
                ))}
              </RevealGroup>
            )}
          </div>

          {/* CTA Banner */}
          <Reveal className="relative rounded-2xl overflow-hidden mb-xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDlS9i9X3D7eSwgbotdQBSy-l6wUCl-D5Q-7Qq_ifyGDm1-MAhI_jOfOJ4eErR6E-ra1M-1nAGDnNtty-XARCorCrNExwQuIywmnpefjYyuNvSgJIGTRYztFsbtUE69IYn4K6nx249SktVrG_RIHjWmdDxmB5F9-aSP5fd8P1C6shZqGTLOyQIbTlm4XQ3yzfhUTh4fpKDbJ8JM49vzlOiDiw_78fHM7EAXsvQOpLJ3uz-9veljTX1OE2VDSO3YD5JD-smDa0BeIuA')`,
              }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
            <div className="relative z-10 px-gutter py-xl text-center">
              <h3 className="text-headline-lg font-bold text-on-primary mb-sm">
                Ready to Discuss Your Symptoms?
              </h3>
              <p className="text-body-md text-on-primary/90 mb-lg max-w-xl mx-auto">
                Dr. Zaid Gul provides personalized consultation to ensure you
                receive the most accurate diagnosis and treatment plan.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/book-appointment/step-1"
                    className="block bg-surface text-primary px-lg py-md rounded-xl text-label-md font-semibold shadow-lg hover:bg-surface-container transition-colors"
                  >
                    Book a Consultation
                  </Link>
                </motion.div>
                <motion.a
                  href={buildWhatsappLink(doctor.contactWhatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-on-primary text-on-primary px-lg py-md rounded-xl text-label-md font-semibold hover:bg-on-primary/10 transition-colors"
                >
                  Contact Clinic
                </motion.a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
