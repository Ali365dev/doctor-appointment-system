"use client";

import Link from "next/link";
import { useBookingStore } from "@/store/bookingStore";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface Loc {
  name: string;
  address: string | null;
  fee_pkr: number;
  timings: Record<string, string>;
  map_link?: string;
  coordinates?: { lat: number; lng: number };
  booking_link?: string;
}

interface ClinicCardProps {
  loc: Loc;
  index: number;
  variant?: "featured" | "standard";
  shift?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Hospital placeholder images from the design reference
const CLINIC_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDJo-DhF7JckDcOakZJqynGdQAZfh66keSQGQu5VeeIDb6jVxLz9a27fCgYK7RSslTfy7vOl4yyAJOwiiMQ99-GtiS0T-q5_YLirzLzn-Sc3WsAdKko-gIOb3QDjZdG7P6UrLIyLMNaG6vBPrat-ks_UxEdGmIoG5knXpcUpIjd1eQkPmhoZkZB83G_GhvMtDb31RH6-rlD9TRjwXX2bgsRBmnk0tfHNywvIfy4aM-B-lzb5jb08kFyy9GDG1WAa0m7kAUuNkW7SKg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAAx0fXZH7EZ_6Qy22wNHySAMCY5PuOYcF_uEn4lqr0j30Di7m3oxlD6s4qC5HHtH5z1OAuCR1aWGV0mlNMszBW56u_BUq8jae_7yI-Os1d2Vv61_KXJmtwK-rb_2YRuHFRkQJADV9LgD0Eu8ee-JdJ_wmegRR5iqc8Pwi6rvo-lIO2F79bpSjMOT0bETmDbgDNptcuVhpHXaK74mhV6jskuHqv1GlpdI3j1v1shZdyFv2kTQyUhlmOvrbTmevU5yXrBRnXgCvZ9bY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCn0liy8WBMhAnXb79c6hVznyrUUFjx45woCENTAG7HymwZVrUXyAKDM1PPmtVV88w4qYoX2n9XjOXNWmLoa_6BvuIxDbhw21i843dchJ0O9pvxlqJOQRjS2RG5w5E8P1vIYoLib3YdREXvSH1Xvi00BvvkbD_ivRNKgrPteR-NsS4WQZJyH7ZYPBOhoGV_MH1j6_k6vSckHRnHzpl4oO0jlSAx6o8A5L43DvSEVjQwyd-zxtZCTXYpgFvAoUnHYgT8V4wBoMb2ZwE",
];

const SHIFT_LABELS = ["Evening Shift", "Evening Shift", "Night Shift"];

export default function ClinicCard({ loc, index, variant = "standard", shift }: ClinicCardProps) {
  const router = useRouter();
  const setClinic = useBookingStore((s) => s.setClinic);

  const timingDays = DAYS.filter((d) => d in loc.timings);

  const handleBook = useCallback(() => {
    setClinic({
      id: `loc-${index}`,
      name: loc.name,
      address: loc.address,
      fee_pkr: loc.fee_pkr,
      timings: loc.timings,
      booking_link: loc.booking_link,
      map_link: loc.map_link,
    });
    router.push("/book-appointment/step-1");
  }, [setClinic, router, loc, index]);

  const shiftLabel = shift ?? SHIFT_LABELS[index] ?? "Daytime";
  const imgSrc = CLINIC_IMAGES[index] ?? CLINIC_IMAGES[0];

  if (variant === "featured") {
    return (
      <div className="glass-card rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row h-full bg-white/70 backdrop-blur-xl border border-gray-200/50">
        <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden shrink-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${imgSrc}')`, minHeight: "260px" }}
            aria-label={loc.name}
          />
        </div>
        <div className="md:w-1/2 p-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-xs text-primary mb-xs">
              <span className="material-symbols-outlined">location_on</span>
              <span className="text-label-md font-semibold">{loc.address ? loc.address.split(",")[0] : loc.name}</span>
            </div>
            <h2 className="text-headline-lg font-bold mb-sm">{loc.name}</h2>
            {loc.address && (
              <p className="text-on-surface-variant text-body-md mb-md">{loc.address}</p>
            )}
            <div className="space-y-xs mb-md">
              {timingDays.map((day) => (
                <div key={day} className="flex justify-between border-b border-outline-variant/30 pb-xs text-body-md">
                  <span className="text-on-surface-variant">{day}</span>
                  <span className="font-semibold">{loc.timings[day]}</span>
                </div>
              ))}
              <div className="flex justify-between pt-xs text-primary">
                <span className="font-semibold">Consultation Fee</span>
                <span className="font-bold">PKR {loc.fee_pkr.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleBook}
            className="w-full bg-primary text-on-primary py-sm rounded-xl text-label-md font-semibold hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Book at {loc.name.split("(")[0].trim()}
          </button>
        </div>
      </div>
    );
  }

  // Standard card
  return (
    <div className="glass-card rounded-xl shadow-sm overflow-hidden flex flex-col bg-white/70 backdrop-blur-xl border border-gray-200/50">
      <div className="h-48 overflow-hidden relative">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${imgSrc}')` }}
          aria-label={loc.name}
        />
        <div className="absolute top-4 right-4 bg-white px-sm py-1 rounded-full text-primary text-label-md font-semibold shadow-sm">
          {shiftLabel}
        </div>
      </div>
      <div className="p-lg flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-headline-md font-semibold mb-xs">{loc.name}</h3>
          {loc.address && (
            <p className="text-on-surface-variant mb-md text-body-md">{loc.address}</p>
          )}
          <ul className="space-y-sm mb-lg">
            {timingDays.map((day) => (
              <li key={day} className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">{day}</span>
                <span className="font-semibold">{loc.timings[day]}</span>
              </li>
            ))}
            <li className="flex justify-between pt-sm border-t border-outline-variant/20 text-primary">
              <span className="font-semibold">Consultation Fee</span>
              <span className="font-bold">PKR {loc.fee_pkr.toLocaleString()}</span>
            </li>
          </ul>
        </div>
        <button
          onClick={handleBook}
          className="w-full border-2 border-primary text-primary py-sm rounded-xl text-label-md font-semibold hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">event</span>
          Book at {loc.name.split("(")[0].trim()}
        </button>
      </div>
    </div>
  );
}
