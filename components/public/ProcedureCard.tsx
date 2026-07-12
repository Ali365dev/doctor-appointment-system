"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { useBookingStore } from "@/store/bookingStore";
import { doctor } from "@/lib/data";
import AnimatedCounter from "@/components/common/AnimatedCounter";

const PROCEDURE_ICONS: Record<string, string> = {
  ERCP: "medical_services",
  Colonoscopy: "biotech",
  Endoscopy: "visibility",
  "Foreign Body Removal via Endoscopy from Esophagus and Stomach": "emergency",
  Polypectomies: "science",
  "Stricture Dilatation": "vital_signs",
  "PEG Tube Placement": "vaccines",
  "Esophageal Banding for Bleeding from Varices": "monitor_heart",
};

const PROCEDURE_DESCS: Record<string, string> = {
  ERCP: "Endoscopic Retrograde Cholangiopancreatography",
  Colonoscopy: "Full bowel examination for screening & diagnosis",
  Endoscopy: "Upper GI visual examination & biopsy",
  "Foreign Body Removal via Endoscopy from Esophagus and Stomach":
    "Minimally invasive retrieval from upper digestive tract",
  Polypectomies: "Endoscopic removal of polyps from colon or stomach",
  "Stricture Dilatation": "Treatment of narrowed digestive tract segments",
  "PEG Tube Placement": "Percutaneous endoscopic gastrostomy tube insertion",
  "Esophageal Banding for Bleeding from Varices":
    "Endoscopic treatment for esophageal variceal bleeding",
};

interface Treatment {
  name: string;
  price_pkr: number;
  original_price_pkr: number;
  discount_percent: number;
  location: string;
}

interface ProcedureCardProps {
  treatment: Treatment;
  featured?: boolean;
}

export default function ProcedureCard({ treatment, featured }: ProcedureCardProps) {
  const router = useRouter();
  const setClinic = useBookingStore((s) => s.setClinic);

  const handleSelect = useCallback(() => {
    const loc = doctor.practice_locations.find((l) =>
      treatment.location.includes(l.name)
    );
    if (loc) {
      setClinic({
        id: `loc-${doctor.practice_locations.indexOf(loc)}`,
        name: loc.name,
        address: loc.address,
        fee_pkr: loc.fee_pkr,
        timings: loc.timings as Record<string, string>,
        booking_link: (loc as { booking_link?: string }).booking_link,
        map_link: (loc as { map_link?: string }).map_link,
      });
    }
    router.push("/book-appointment/step-1");
  }, [setClinic, router, treatment]);

  const icon = PROCEDURE_ICONS[treatment.name] ?? "medical_services";
  const desc = PROCEDURE_DESCS[treatment.name] ?? treatment.location;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className={`bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col h-full relative overflow-hidden group transition-shadow duration-300 hover:shadow-xl ${
        featured ? "ring-2 ring-primary" : ""
      }`}
    >
      {featured && (
        <div className="absolute top-0 right-0 bg-primary px-sm py-xs text-on-primary text-label-md font-semibold">
          Most Specialized
        </div>
      )}

      <div className="mb-md">
        <span
          className="material-symbols-outlined text-primary mb-sm block"
          style={{ fontVariationSettings: featured ? "'FILL' 1" : "'FILL' 0" }}
        >
          {icon}
        </span>
        <h3 className="text-headline-md font-semibold mb-xs">{treatment.name}</h3>
        <p className="text-caption text-on-surface-variant">{desc}</p>
      </div>

      <div className="mt-auto pt-md border-t border-outline-variant/20">
        <div className="flex items-baseline gap-xs">
          <span className="text-headline-lg font-bold text-primary">
            <AnimatedCounter value={treatment.price_pkr} format />
          </span>
          <span className="text-label-md text-on-surface-variant">PKR</span>
        </div>
        <div className="flex items-center gap-sm mt-xs">
          <span className="line-through text-outline text-body-md">
            {treatment.original_price_pkr.toLocaleString()}
          </span>
          <span className="bg-error-container text-on-error-container px-xs py-[2px] rounded text-[10px] font-semibold">
            {treatment.discount_percent}% OFF
          </span>
        </div>
      </div>

      <button
        onClick={handleSelect}
        className={`w-full mt-md py-sm rounded-xl text-label-md font-semibold transition-all ${
          featured
            ? "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary"
            : "bg-secondary text-on-secondary hover:bg-secondary/90"
        }`}
      >
        Select Procedure
      </button>
    </motion.div>
  );
}
