"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { doctor } from "@/lib/data";
import ProcedureCard, { type Procedure as ProcedureCardData } from "@/components/public/ProcedureCard";

interface ClinicOption {
  id: string;
  name: string;
  city: string;
  address?: string;
  priceOverridePkr?: number;
}

interface ProcedureDetail {
  id: string;
  name: string;
  fullDescription?: string;
  shortDescription?: string;
  pricePkr: number;
  originalPricePkr?: number;
  discountPercent?: number;
  durationMinutes: number;
  image?: string;
  benefits: string[];
  risks: string[];
  preparationInstructions?: string;
  recoveryTime?: string;
  faqs: { question: string; answer: string }[];
}

export default function ProcedureDetailContent({
  procedure,
  clinics,
  related,
}: {
  procedure: ProcedureDetail;
  clinics: ClinicOption[];
  related: ProcedureCardData[];
}) {
  const router = useRouter();
  const setClinic = useBookingStore((s) => s.setClinic);
  const setProcedure = useBookingStore((s) => s.setProcedure);

  const bookAt = (clinic?: ClinicOption) => {
    setProcedure({
      procedureId: procedure.id,
      name: procedure.name,
      pricePkr: clinic?.priceOverridePkr ?? procedure.pricePkr,
      durationMinutes: procedure.durationMinutes,
    });
    if (clinic) {
      setClinic({
        id: clinic.id,
        name: clinic.name,
        address: clinic.address ?? null,
        fee_pkr: clinic.priceOverridePkr ?? procedure.pricePkr,
        timings: {},
      });
    } else if (clinics.length === 1) {
      const only = clinics[0];
      setClinic({
        id: only.id,
        name: only.name,
        address: only.address ?? null,
        fee_pkr: only.priceOverridePkr ?? procedure.pricePkr,
        timings: {},
      });
    }
    router.push(`/book-appointment/step-1?procedure=${procedure.id}`);
  };

  const hasDiscount = !!procedure.discountPercent && procedure.discountPercent > 0 && !!procedure.originalPricePkr;

  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="relative w-full py-xl bg-surface-container-low overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          {/* Left content */}
          <div className="lg:col-span-7">
            <nav className="flex items-center flex-wrap gap-2 mb-md text-on-surface-variant/70 text-caption">
              <Link href="/services" className="hover:text-primary">Services</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-primary font-medium">{procedure.name}</span>
            </nav>
            <h1 className="text-display font-bold text-on-surface mb-md leading-tight">{procedure.name}</h1>
            {procedure.shortDescription && (
              <p className="text-body-lg text-on-surface-variant mb-lg max-w-2xl">{procedure.shortDescription}</p>
            )}
            <div className="flex flex-wrap gap-sm mb-lg">
              <div className="flex items-center gap-2 px-md py-xs bg-surface rounded-xl shadow-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
                <span className="text-label-md">~{procedure.durationMinutes} min</span>
              </div>
              <div className="flex items-center gap-2 px-md py-xs bg-surface rounded-xl shadow-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                <span className="text-label-md">
                  {clinics.length > 0 ? `${clinics.length} clinic${clinics.length > 1 ? "s" : ""} available` : "Call to check availability"}
                </span>
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-2 px-md py-xs bg-tertiary-container/10 text-tertiary-container rounded-xl border border-tertiary-container/20">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>sell</span>
                  <span className="text-label-md font-bold">{procedure.discountPercent}% OFF</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-sm">
              <button
                onClick={() => bookAt()}
                className="bg-primary text-on-primary px-lg py-md rounded-2xl text-label-md font-semibold flex items-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                Book Procedure
              </button>
              <a
                href={doctor.contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-outline-variant text-on-surface px-lg py-md rounded-2xl text-label-md font-semibold flex items-center gap-2 hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-green-600">chat</span>
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right visual */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative bg-primary/5">
              {procedure.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={procedure.image} alt={procedure.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary/40" style={{ fontSize: 140 }}>medical_services</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-md left-md right-md bg-white/70 backdrop-blur-md p-md rounded-2xl border border-white/20">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-lg">
                    <Image src={doctor.profile_image} alt={doctor.name} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <div>
                    <div className="text-on-surface font-bold">{doctor.name}</div>
                    <div className="text-on-surface-variant text-caption">{doctor.specialization.join(" & ")}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary-container/20 blur-3xl rounded-full -z-10" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary-container/20 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-[1280px] mx-auto px-gutter py-xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Content column */}
          <div className="lg:col-span-8 space-y-xl">
            {/* Quick info grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
              <div className="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant/30 hover:shadow-md transition-shadow">
                <span className="material-symbols-outlined text-primary mb-xs block">payments</span>
                <div className="text-caption text-on-surface-variant uppercase tracking-wider">Starting Price</div>
                <div className="text-headline-md text-on-surface">Rs. {procedure.pricePkr.toLocaleString()}</div>
                {hasDiscount && (
                  <div className="text-caption text-on-surface-variant/60 line-through">
                    Rs. {procedure.originalPricePkr!.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant/30 hover:shadow-md transition-shadow">
                <span className="material-symbols-outlined text-primary mb-xs block">history</span>
                <div className="text-caption text-on-surface-variant uppercase tracking-wider">Duration</div>
                <div className="text-headline-md text-on-surface">~{procedure.durationMinutes} min</div>
              </div>
              <div className="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant/30 hover:shadow-md transition-shadow">
                <span className="material-symbols-outlined text-primary mb-xs block">healing</span>
                <div className="text-caption text-on-surface-variant uppercase tracking-wider">Recovery</div>
                <div className="text-headline-md text-on-surface">{procedure.recoveryTime || "—"}</div>
              </div>
            </div>

            {/* About */}
            {procedure.fullDescription && (
              <div>
                <h2 className="text-headline-lg font-bold text-on-surface mb-md">About the Procedure</h2>
                <p className="text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {procedure.fullDescription}
                </p>
              </div>
            )}

            {/* Benefits & Risks */}
            {(procedure.benefits.length > 0 || procedure.risks.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {procedure.benefits.length > 0 && (
                  <div>
                    <h2 className="text-headline-md font-bold text-on-surface mb-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600">check_circle</span>Benefits
                    </h2>
                    <ul className="space-y-sm">
                      {procedure.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-sm bg-green-50 border border-green-100 p-sm rounded-xl">
                          <span className="material-symbols-outlined text-green-600 mt-0.5 text-[20px]">task_alt</span>
                          <span className="text-body-md text-on-surface-variant">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {procedure.risks.length > 0 && (
                  <div>
                    <h2 className="text-headline-md font-bold text-on-surface mb-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600">warning</span>Risks
                    </h2>
                    <ul className="space-y-sm">
                      {procedure.risks.map((r, i) => (
                        <li key={i} className="flex items-start gap-sm bg-amber-50 border border-amber-100 p-sm rounded-xl">
                          <span className="material-symbols-outlined text-amber-600 mt-0.5 text-[20px]">info</span>
                          <span className="text-body-md text-on-surface-variant">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Preparation Instructions */}
            {procedure.preparationInstructions && (
              <div className="bg-primary/5 border border-primary/20 p-lg rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-lg opacity-10">
                  <span className="material-symbols-outlined text-[80px]">fact_check</span>
                </div>
                <h2 className="text-headline-lg font-bold text-primary mb-md">Preparation Instructions</h2>
                <div className="flex items-start gap-md">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {procedure.preparationInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Available Clinics */}
            <div>
              <h2 className="text-headline-lg font-bold text-on-surface mb-md">Available Clinics</h2>
              {clinics.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">
                  This procedure isn&apos;t currently available for online booking. Please WhatsApp or call us.
                </p>
              ) : (
                <div className="space-y-sm">
                  {clinics.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-md p-md rounded-2xl border border-outline-variant/30 bg-surface-container-lowest hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-md">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined">location_on</span>
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">{c.name}</div>
                          <div className="text-caption text-on-surface-variant">{c.address ?? c.city}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => bookAt(c)}
                        className="shrink-0 bg-primary text-on-primary px-md py-xs rounded-xl text-label-md font-semibold hover:opacity-90 transition-all"
                      >
                        Book Here
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FAQ */}
            {procedure.faqs.length > 0 && (
              <div>
                <h2 className="text-headline-lg font-bold text-on-surface mb-md">Frequently Asked Questions</h2>
                <div className="space-y-sm">
                  {procedure.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm"
                      open={i === 0}
                    >
                      <summary className="flex justify-between items-center p-md cursor-pointer list-none hover:bg-surface-container-low transition-colors">
                        <span className="font-bold text-on-surface">{faq.question}</span>
                        <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                      </summary>
                      <div className="px-md pb-md text-on-surface-variant leading-relaxed">{faq.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-md">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[2rem] p-lg shadow-xl">
                <div className="mb-md">
                  <h3 className="text-headline-md font-bold text-on-surface mb-xs">{procedure.name}</h3>
                  <div className="flex items-center gap-2 text-primary font-bold text-xl mb-1">
                    From Rs. {procedure.pricePkr.toLocaleString()}
                    {hasDiscount && (
                      <span className="text-on-surface-variant/40 text-caption line-through font-normal">
                        Rs. {procedure.originalPricePkr!.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <div className="text-caption text-secondary font-medium">{procedure.discountPercent}% OFF · Limited time</div>
                  )}
                </div>
                <div className="space-y-sm mb-lg">
                  <div className="flex items-center justify-between text-sm py-xs border-b border-outline-variant/10">
                    <span className="text-on-surface-variant">Duration</span>
                    <span className="font-bold">~{procedure.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-xs border-b border-outline-variant/10">
                    <span className="text-on-surface-variant">Specialist</span>
                    <span className="font-bold">{doctor.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-xs">
                    <span className="text-on-surface-variant">Clinics</span>
                    <span className="font-bold">{clinics.length > 0 ? `${clinics.length} available` : "Call us"}</span>
                  </div>
                </div>
                <div className="space-y-sm">
                  <button
                    onClick={() => bookAt()}
                    className="w-full bg-primary text-on-primary py-md rounded-2xl font-bold hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    Book Procedure
                  </button>
                  <a
                    href={`tel:${doctor.contact.helpline}`}
                    className="w-full bg-surface-variant/30 border border-outline-variant/30 text-on-surface py-md rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-surface-variant transition-all"
                  >
                    <span className="material-symbols-outlined text-green-600">call</span>
                    Inquiry Helpline
                  </a>
                </div>
                <p className="text-center text-caption text-on-surface-variant/60 mt-md">
                  Fully accredited clinical facility with modern infection control standards.
                </p>
              </div>

              <div className="bg-secondary-container/10 p-md rounded-2xl border border-secondary-container/20 flex items-center gap-md">
                <span className="material-symbols-outlined text-secondary text-4xl">verified_user</span>
                <div>
                  <div className="font-bold text-on-surface">Patient Safety First</div>
                  <div className="text-caption text-on-surface-variant">Fully accredited, sterile procedure rooms with modern infection control.</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related Procedures */}
      {related.length > 0 && (
        <section className="bg-surface-container-low py-xl">
          <div className="max-w-[1280px] mx-auto px-gutter">
            <div className="flex justify-between items-end mb-lg">
              <div>
                <h2 className="text-headline-lg font-bold text-on-surface mb-xs">Related Procedures</h2>
                <p className="text-on-surface-variant">Other gastroenterology services offered by {doctor.name}</p>
              </div>
              <Link href="/services" className="text-primary font-bold flex items-center gap-2 hover:underline shrink-0">
                View All Services <span className="material-symbols-outlined">arrow_right_alt</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {related.map((p) => (
                <ProcedureCard key={p.id} treatment={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
