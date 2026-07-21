"use client";

import { useCallback } from "react";
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

export default function ConditionsSearch({ conditions }: Props) {
  const doctor = useDoctorProfile();
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

  return (
    <>
      {/* Main canvas */}
      <section className="px-gutter pb-xl">
        <div className="max-w-[1280px] mx-auto">

          {/* Conditions Grid */}
          <div className="mb-xl">
            <Reveal className="flex items-center gap-xs mb-lg">
              <span className="material-symbols-outlined text-primary">healing</span>
              <h2 className="text-headline-lg font-bold">Conditions Treated</h2>
            </Reveal>

            {conditions.length === 0 ? (
              <div className="text-center py-xl text-on-surface-variant">
                <p className="text-body-lg">No conditions available right now.</p>
              </div>
            ) : (
              <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                {conditions.map((condition) => (
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
