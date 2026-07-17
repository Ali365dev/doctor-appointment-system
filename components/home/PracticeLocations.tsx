"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import { useRouter } from "next/navigation";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { useBookingStore } from "@/store/bookingStore";
import type { WeeklySchedule } from "@/types/clinic";

interface Loc {
  id: string;
  name: string;
  address: string | null;
  fee_pkr: number;
  timings: Record<string, string>;
  schedule?: WeeklySchedule;
  defaultSlotDurationMinutes?: number;
  image?: string;
  map_link?: string;
  coordinates?: { lat: number; lng: number };
  booking_link?: string;
}

interface ApiClinic {
  _id: string;
  name: string;
  address?: string | null;
  feePkr: number;
  timings: Record<string, string>;
  schedule?: WeeklySchedule;
  defaultSlotDurationMinutes?: number;
  image?: string;
  latitude?: number | null;
  longitude?: number | null;
  mapLink?: string | null;
}

function toLoc(c: ApiClinic): Loc {
  return {
    id: c._id,
    name: c.name,
    address: c.address ?? null,
    fee_pkr: c.feePkr,
    timings: c.timings ?? {},
    schedule: c.schedule,
    defaultSlotDurationMinutes: c.defaultSlotDurationMinutes,
    image: c.image,
    coordinates:
      c.latitude != null && c.longitude != null ? { lat: c.latitude, lng: c.longitude } : undefined,
    map_link: c.mapLink ?? undefined,
  };
}

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

function buildEmbedUrl(loc: Loc): string {
  if (loc.coordinates) {
    const { lat, lng } = loc.coordinates;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&ie=UTF8&iwloc=&output=embed`;
  }
  const q = encodeURIComponent(`${loc.name} Faisalabad Pakistan`);
  return `https://maps.google.com/maps?q=${q}&z=14&ie=UTF8&iwloc=&output=embed`;
}

const PersistentMap = memo(function PersistentMap({
  locations,
  activeIndex,
  containerRef,
}: {
  locations: Loc[];
  activeIndex: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const embedUrls = useMemo(() => locations.map(buildEmbedUrl), [locations]);

  return (
    <div
      ref={containerRef}
      className="relative h-[380px] lg:h-full lg:min-h-[460px] rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm bg-surface-container-low"
      aria-label={`Map for ${locations[activeIndex]?.name}`}
    >
      {locations.map((loc, i) => (
        <iframe
          key={i}
          src={embedUrls[i]}
          className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-500 ease-in-out ${
            i === activeIndex
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Google Map — ${loc.name}`}
          aria-hidden={i !== activeIndex}
        />
      ))}
      <div className="absolute bottom-3 left-3 z-10 bg-surface/90 backdrop-blur-sm px-sm py-xs rounded-lg border border-outline-variant/30 shadow-sm pointer-events-none">
        <p className="text-caption font-semibold text-on-surface truncate max-w-[200px]">
          {locations[activeIndex]?.name}
        </p>
      </div>
    </div>
  );
});

const LocationCard = memo(function LocationCard({
  loc,
  index,
  isActive,
  onSelect,
  cardRef,
}: {
  loc: Loc;
  index: number;
  isActive: boolean;
  onSelect: (i: number) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`Select ${loc.name}`}
      onClick={() => onSelect(index)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(index)}
      className={`shrink-0 snap-center cursor-pointer rounded-xl border px-md py-sm transition-all duration-300 outline-none w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-11px)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center justify-center text-center ${
        isActive
          ? "border-primary bg-primary/5"
          : "border-outline-variant bg-surface hover:border-primary/30"
      }`}
    >
      <p className={`text-label-md font-bold leading-snug truncate ${isActive ? "text-primary" : "text-on-surface"}`}>
        {loc.name}
      </p>
    </div>
  );
});

export default function PracticeLocations() {
  const doctor = useDoctorProfile();
  const [locations, setLocations] = useState<Loc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const router = useRouter();
  const setClinic = useBookingStore((s) => s.setClinic);

  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/clinics");
        const data = await res.json();
        if (!cancelled && res.ok) {
          setLocations((data.clinics ?? []).map(toLoc));
        }
      } catch {
        // Non-fatal — the section just won't render.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = locations[activeIndex];
  const timingDays = active ? DAYS.filter((d) => d in active.timings) : [];
  const closedDays = active ? DAYS.filter((d) => !(d in active.timings)) : [];

  const goTo = useCallback(
    (i: number) => {
      const next = ((i % locations.length) + locations.length) % locations.length;
      setActiveIndex(next);
      cardRefs.current[next]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    },
    [locations.length]
  );

  const prev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);
  const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    },
    [prev, next]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = touchStartXRef.current - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
    },
    [next, prev]
  );

  const handleBook = useCallback(
    (loc: Loc) => {
      setClinic({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        fee_pkr: loc.fee_pkr,
        timings: loc.timings,
        schedule: loc.schedule,
        defaultSlotDurationMinutes: loc.defaultSlotDurationMinutes,
        booking_link: loc.booking_link,
        map_link: loc.map_link,
      });
      router.push("/book-appointment/step-1");
    },
    [setClinic, router]
  );

  const handleDirections = useCallback((idx: number) => {
    setActiveIndex(idx);
    requestAnimationFrame(() => {
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  const assignCardRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => { cardRefs.current[i] = el; },
    []
  );

  if (loading || !locations.length || !active) return null;

  return (
    <section
      id="clinic-info"
      className="py-xl px-gutter bg-surface-container-high/50 focus:outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      aria-label="Practice Locations carousel"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-xl">
          <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
            Practice Locations
          </h2>
          <p className="text-on-surface-variant mt-xs max-w-xl mx-auto">
            Dr. {doctor.name.split(" ").slice(1).join(" ")} consults at{" "}
            {locations.length} locations across {doctor.city}
          </p>
        </div>

        <div className="relative mb-lg">
        

          <div
            ref={trackRef}
            className="flex gap-md overflow-x-auto scroll-smooth [scroll-snap-type:x_mandatory] scrollbar-hide px-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="listbox"
            aria-label="Practice locations"
          >
            {locations.map((loc, i) => (
              <LocationCard
                key={i}
                loc={loc}
                index={i}
                isActive={activeIndex === i}
                onSelect={goTo}
                cardRef={assignCardRef(i)}
              />
            ))}
          </div>

        </div>

        <div className="flex justify-center items-center gap-xs mb-xl" role="tablist">
          {locations.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={activeIndex === i}
              aria-label={`Location ${i + 1}: ${locations[i].name}`}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary ${
                activeIndex === i ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-outline-variant hover:bg-primary/40"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-stretch">
          <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-lg space-y-md flex flex-col">
            <div>
              <span className="text-caption font-bold uppercase tracking-widest text-primary">
                Location {activeIndex + 1} of {locations.length}
              </span>
              <h3 className="text-headline-md font-bold text-on-surface mt-xs">{active.name}</h3>
              {active.address && (
                <p className="text-on-surface-variant mt-xs flex items-start gap-xs">
                  <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">location_on</span>
                  {active.address}
                </p>
              )}
            </div>

            <div className="flex items-center gap-sm p-sm bg-primary/5 rounded-xl border border-primary/10">
              <span className="material-symbols-outlined text-primary">payments</span>
              <div>
                <p className="text-caption text-on-surface-variant">Consultation Fee</p>
                <p className="text-headline-md font-bold text-primary">Rs. {active.fee_pkr.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-xs mb-sm">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <h4 className="text-label-md font-semibold text-on-surface">Clinic Timings</h4>
              </div>
              <div className="space-y-xs">
                {timingDays.map((day) => (
                  <div key={day} className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">{day}</span>
                    <span className="font-semibold text-on-surface">{active.timings[day]}</span>
                  </div>
                ))}
                {closedDays.map((day) => (
                  <div key={day} className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">{day}</span>
                    <span className="font-semibold text-error">Closed</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-sm pt-sm">
              <button
                onClick={() => handleBook(active)}
                className="flex items-center gap-xs bg-primary text-on-primary px-md py-xs rounded-xl text-label-md font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                Book Appointment
              </button>
              {active.map_link && (
                <a
                  href={active.map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-xs border border-outline-variant text-on-surface-variant px-md py-xs rounded-xl text-label-md font-semibold hover:border-primary/40 hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  Open in Maps
                </a>
              )}
            </div>
          </div>

          <PersistentMap
            locations={locations}
            activeIndex={activeIndex}
            containerRef={mapContainerRef}
          />
        </div>
      </div>
    </section>
  );
}
