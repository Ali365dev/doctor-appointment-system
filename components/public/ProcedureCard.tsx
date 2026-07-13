"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useBookingStore } from "@/store/bookingStore";
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

export interface Procedure {
  id: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  location: string;
  pricePkr: number;
  originalPricePkr: number;
  discountPercent: number;
  durationMinutes?: number;
}

interface ApiClinic {
  _id: string;
  name: string;
  address?: string;
  feePkr: number;
  timings: Record<string, string>;
  schedule?: unknown;
  defaultSlotDurationMinutes?: number;
  mapLink?: string;
}

interface ApiAssignment {
  clinicId: ApiClinic | string;
  priceOverridePkr?: number;
  durationOverrideMinutes?: number;
  isActive: boolean;
}

interface ProcedureCardProps {
  treatment: Procedure;
  featured?: boolean;
}

export default function ProcedureCard({ treatment, featured }: ProcedureCardProps) {
  const router = useRouter();
  const setClinic = useBookingStore((s) => s.setClinic);
  const setProcedure = useBookingStore((s) => s.setProcedure);
  const [selecting, setSelecting] = useState(false);

  const handleSelect = useCallback(async () => {
    setSelecting(true);
    try {
      const res = await fetch(`/api/procedures/${treatment.id}/clinics`);
      const data = await res.json();
      const assignments: ApiAssignment[] = res.ok ? data.assignments ?? [] : [];
      const active = assignments.filter(
        (a) => a.isActive && a.clinicId && typeof a.clinicId === "object"
      );

      if (active.length === 0) {
        toast.error("This procedure isn't currently available for online booking. Please WhatsApp or call us.");
        return;
      }

      setProcedure({
        procedureId: treatment.id,
        name: treatment.name,
        pricePkr: treatment.pricePkr,
        durationMinutes: treatment.durationMinutes ?? 30,
      });

      if (active.length === 1) {
        const clinic = active[0].clinicId as ApiClinic;
        setClinic({
          id: clinic._id,
          name: clinic.name,
          address: clinic.address ?? null,
          fee_pkr: clinic.feePkr,
          timings: clinic.timings,
          defaultSlotDurationMinutes: clinic.defaultSlotDurationMinutes,
          map_link: clinic.mapLink,
        });
      }

      router.push(`/book-appointment/step-1?procedure=${treatment.id}`);
    } catch {
      toast.error("Could not check availability for this procedure. Please try again.");
    } finally {
      setSelecting(false);
    }
  }, [setClinic, setProcedure, router, treatment]);

  const icon = PROCEDURE_ICONS[treatment.name] ?? "medical_services";
  const desc = treatment.shortDescription || PROCEDURE_DESCS[treatment.name] || treatment.location;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: "0px 0px -10% 0px" }}
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
        <h3 className="text-headline-md font-semibold mb-xs">
          {treatment.slug ? (
            <Link href={`/procedures/${treatment.slug}`} className="hover:text-primary transition-colors">
              {treatment.name}
            </Link>
          ) : (
            treatment.name
          )}
        </h3>
        <p className="text-caption text-on-surface-variant">{desc}</p>
      </div>

      <div className="mt-auto pt-md border-t border-outline-variant/20">
        <div className="flex items-baseline gap-xs">
          <span className="text-headline-lg font-bold text-primary">
            <AnimatedCounter value={treatment.pricePkr} format />
          </span>
          <span className="text-label-md text-on-surface-variant">PKR</span>
        </div>
        {treatment.discountPercent > 0 && (
          <div className="flex items-center gap-sm mt-xs">
            <span className="line-through text-outline text-body-md">
              {treatment.originalPricePkr.toLocaleString()}
            </span>
            <span className="bg-error-container text-on-error-container px-xs py-0.5 rounded text-[10px] font-semibold">
              {treatment.discountPercent}% OFF
            </span>
          </div>
        )}
      </div>

      <button
        onClick={handleSelect}
        disabled={selecting}
        className={`w-full mt-md py-sm rounded-xl text-label-md font-semibold transition-all disabled:opacity-60 ${
          featured
            ? "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary"
            : "bg-secondary text-on-secondary hover:bg-secondary/90"
        }`}
      >
        {selecting ? "Preparing…" : "Select Procedure"}
      </button>
    </motion.div>
  );
}
