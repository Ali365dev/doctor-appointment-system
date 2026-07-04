import Link from "next/link";
import { doctor } from "@/lib/data";
import ClinicCard from "@/components/public/ClinicCard";

export const metadata = {
  title: "Clinics & Locations | Dr. Zaid Gul",
  description:
    "Find Dr. Zaid Gul's practice locations in Faisalabad. Specialized gastroenterology care at Chughtai Medical Centre, Faisal Hospital, and United Hospital.",
};

interface Loc {
  name: string;
  address: string | null;
  fee_pkr: number;
  timings: Record<string, string>;
  coordinates?: { lat: number; lng: number };
  map_link?: string;
  booking_link?: string;
}

function buildEmbedUrl(loc: Loc): string {
  const coords = loc.coordinates;
  if (coords) {
    return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&ie=UTF8&iwloc=&output=embed`;
  }
  const q = encodeURIComponent(`${loc.name} Faisalabad Pakistan`);
  return `https://maps.google.com/maps?q=${q}&z=14&ie=UTF8&iwloc=&output=embed`;
}

const CONSOLIDATED_MAP =
  "https://maps.google.com/maps?q=31.41,73.10&z=13&ie=UTF8&iwloc=&output=embed";

export default function ClinicPage() {
  const locations = doctor.practice_locations as unknown as Loc[];
  const [loc0, loc1, loc2] = locations;

  return (
    <main className="pt-24 min-h-screen">
      {/* ── Hero ── */}
      <section className="relative py-xl overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-gutter relative z-10 text-center">
          <span className="inline-block px-sm py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-label-md font-semibold mb-md">
            Clinical Accessibility
          </span>
          <h1 className="text-display font-bold text-on-surface mb-md">
            Clinics &amp; Locations
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Choose the practice location most convenient for you. Dr. Zaid Gul
            provides specialized care across {doctor.city}&apos;s premier medical
            institutions with structured consultation hours.
          </p>
        </div>
      </section>

      {/* ── Locations Bento Grid ── */}
      <section className="py-xl max-w-[1280px] mx-auto px-gutter">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Location 1 – Featured */}
          {loc0 && (
            <div className="lg:col-span-8 flex flex-col gap-gutter">
              <ClinicCard loc={loc0} index={0} variant="featured" />
            </div>
          )}

          {/* Map Widget for Location 1 */}
          {loc0 && (
            <div className="lg:col-span-4 rounded-xl p-1 shadow-sm overflow-hidden min-h-[300px] bg-white/70 backdrop-blur-xl border border-gray-200/50">
              <div className="w-full h-full rounded-lg bg-surface-container overflow-hidden relative min-h-[300px]">
                <iframe
                  src={buildEmbedUrl(loc0)}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map — ${loc0.name}`}
                />
                <div className="absolute bottom-4 left-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md p-sm rounded-lg border border-outline-variant/30 pointer-events-none">
                  <p className="text-label-md font-semibold text-on-surface truncate">
                    {loc0.name}
                  </p>
                  {loc0.map_link && (
                    <a
                      href={loc0.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-caption font-semibold flex items-center gap-1 mt-1 pointer-events-auto"
                    >
                      Get Directions
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Locations 2 & 3 */}
          {loc1 && (
            <div className="lg:col-span-6">
              <ClinicCard loc={loc1} index={1} variant="standard" shift="Evening Shift" />
            </div>
          )}
          {loc2 && (
            <div className="lg:col-span-6">
              <ClinicCard loc={loc2} index={2} variant="standard" shift="Night Shift" />
            </div>
          )}
        </div>
      </section>

      {/* ── Emergency Consultation Banner ── */}
      <section className="max-w-[1280px] mx-auto px-gutter mb-xl">
        <div className="bg-primary p-lg rounded-xl flex flex-col md:flex-row items-center justify-between gap-md text-on-primary">
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                medical_information
              </span>
            </div>
            <div>
              <h4 className="text-headline-md font-semibold">
                Need an Emergency Consultation?
              </h4>
              <p className="text-on-primary/80 text-body-md">
                For urgent medical attention outside of clinic hours, please
                contact the hospital emergency desk directly.
              </p>
            </div>
          </div>
          <div className="flex gap-sm shrink-0">
            <a
              href={`tel:${doctor.contact.helpline}`}
              className="bg-white text-primary px-lg py-sm rounded-xl text-label-md font-semibold hover:bg-surface-bright transition-colors shadow-lg"
            >
              Call {doctor.contact.helpline}
            </a>
          </div>
        </div>
      </section>

      {/* ── Consolidated Map ── */}
      <section className="py-xl bg-surface-container-low border-y border-outline-variant/20">
        <div className="max-w-[1280px] mx-auto px-gutter">
          <div className="text-center mb-xl">
            <h2 className="text-headline-lg font-bold mb-sm text-on-surface">
              Consolidated Practice Map
            </h2>
            <p className="text-on-surface-variant text-body-md">
              Dr. Zaid Gul practices across key locations in {doctor.city} to
              ensure patient proximity.
            </p>
          </div>

          <div className="h-[500px] rounded-2xl overflow-hidden relative shadow-lg border border-outline-variant/20">
            <iframe
              src={CONSOLIDATED_MAP}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="All clinic locations in Faisalabad"
            />

            {/* Floating location chips */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-sm pointer-events-none">
              {locations.map((loc, i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest/90 backdrop-blur-md px-sm py-xs rounded-lg border border-outline-variant/30 shadow-sm"
                >
                  <p className="text-label-md font-semibold text-on-surface text-[11px] truncate max-w-[160px]">
                    {loc.name}
                  </p>
                  <p className="text-caption text-primary font-semibold">
                    PKR {loc.fee_pkr.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
