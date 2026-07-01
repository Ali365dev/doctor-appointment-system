"use client";

import { useState } from "react";
import { doctor } from "@/lib/data";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function PracticeLocations() {
  const locations = doctor.practice_locations;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = locations[activeIndex];

  if (!locations.length) return null;

  const timingDays = DAYS.filter((d) => d in (active.timings as Record<string, string>));
  const closedDays = DAYS.filter((d) => !(d in (active.timings as Record<string, string>)));

  return (
    <section id="clinic-info" className="py-xl px-gutter bg-surface-container-high/50">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-xl">
          <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
            Practice Locations
          </h2>
          <p className="text-on-surface-variant mt-xs max-w-xl mx-auto">
            Dr. {doctor.name.split(" ").slice(1).join(" ")} consults at {locations.length} locations across {doctor.city}
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-sm justify-center mb-lg">
          {locations.map((loc, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`px-md py-xs rounded-full text-label-md font-semibold transition-all border ${
                activeIndex === i
                  ? "bg-primary text-on-primary border-primary shadow-md"
                  : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary bg-surface"
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        {/* Active Location Card */}
        <div className="bg-surface rounded-2xl shadow-md border border-outline-variant/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Info */}
            <div className="p-lg space-y-md">
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

              {/* Fee */}
              <div className="flex items-center gap-sm p-sm bg-primary/5 rounded-xl border border-primary/10">
                <span className="material-symbols-outlined text-primary">payments</span>
                <div>
                  <p className="text-caption text-on-surface-variant">Consultation Fee</p>
                  <p className="text-headline-md font-bold text-primary">
                    Rs. {active.fee_pkr.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Timings */}
              <div>
                <div className="flex items-center gap-xs mb-sm">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <h4 className="text-label-md font-semibold text-on-surface">Clinic Timings</h4>
                </div>
                <div className="space-y-xs">
                  {timingDays.map((day) => (
                    <div key={day} className="flex justify-between text-body-md">
                      <span className="text-on-surface-variant">{day}</span>
                      <span className="font-semibold text-on-surface">
                        {(active.timings as Record<string, string>)[day]}
                      </span>
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

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-sm pt-sm">
                {active.booking_link ? (
                  <a
                    href={active.booking_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-xs bg-primary text-on-primary px-md py-xs rounded-xl text-label-md font-semibold hover:opacity-90 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Book Appointment
                  </a>
                ) : (
                  <a
                    href={doctor.contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-xs bg-primary text-on-primary px-md py-xs rounded-xl text-label-md font-semibold hover:opacity-90 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Book via WhatsApp
                  </a>
                )}
                {active.map_link && (
                  <a
                    href={active.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-xs border border-primary text-primary px-md py-xs rounded-xl text-label-md font-semibold hover:bg-primary/5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">directions</span>
                    Get Directions
                  </a>
                )}
              </div>
            </div>

            {/* Map placeholder / coordinates */}
            <div className="relative min-h-[300px] lg:min-h-0 bg-surface-container-low flex items-center justify-center">
              {active.map_link ? (
                <a
                  href={active.map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-md text-center p-lg hover:opacity-80 transition-opacity"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      location_on
                    </span>
                  </div>
                  <div>
                    <p className="text-label-md font-semibold text-primary">View on Google Maps</p>
                    <p className="text-caption text-on-surface-variant mt-xs">{active.name}</p>
                    {active.address && (
                      <p className="text-caption text-on-surface-variant">{active.address}</p>
                    )}
                  </div>
                  <span className="text-caption text-primary font-semibold flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Open Maps
                  </span>
                </a>
              ) : (
                <div className="flex flex-col items-center gap-md text-center p-lg">
                  <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-[48px]">
                      location_off
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-body-md">Map not available for this location</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location dots indicator */}
        <div className="flex justify-center gap-xs mt-md">
          {locations.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all ${
                activeIndex === i ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-outline-variant hover:bg-primary/40"
              }`}
              aria-label={`Location ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
