"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { buildWhatsappLink } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import type { Procedure as ProcedureCardData } from "@/components/public/ProcedureCard";

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
  const doctor = useDoctorProfile();
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
      <section className="relative w-full py-lg bg-surface-container-low overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          {/* Left content */}
          <div className="lg:col-span-7">
            <nav className="flex items-center flex-wrap gap-1 mb-sm text-on-surface-variant/70 text-caption">
              <Link href="/services" className="hover:text-primary">Services</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-medium">{procedure.name}</span>
            </nav>
            <span className="inline-flex items-center gap-1 px-sm py-[2px] bg-primary-container/10 text-primary rounded-full border border-primary-container/20 mb-sm text-caption font-semibold">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Certified Specialist Care
            </span>
            <h1 className="text-headline-lg font-bold text-on-surface mb-sm leading-tight">{procedure.name}</h1>
            {procedure.shortDescription && (
              <p className="text-body-md text-on-surface-variant mb-sm max-w-2xl">{procedure.shortDescription}</p>
            )}
            <div className="flex flex-wrap gap-xs mb-md">
              <div className="flex items-center gap-1 px-sm py-[2px] bg-surface rounded-lg shadow-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span>
                <span className="text-caption font-semibold">~{procedure.durationMinutes} min</span>
              </div>
              <div className="flex items-center gap-1 px-sm py-[2px] bg-surface rounded-lg shadow-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
                <span className="text-caption font-semibold">
                  {clinics.length > 0 ? `${clinics.length} clinic${clinics.length > 1 ? "s" : ""} available` : "Call to check availability"}
                </span>
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-1 px-sm py-[2px] bg-tertiary-container/10 text-tertiary-container rounded-lg border border-tertiary-container/20">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>sell</span>
                  <span className="text-caption font-bold">{procedure.discountPercent}% OFF</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-xs">
              <button
                onClick={() => bookAt()}
                className="bg-primary text-on-primary px-md py-xs rounded-lg text-label-md font-semibold flex items-center gap-1 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                Book Procedure
              </button>
              <a
                href={buildWhatsappLink(doctor.contactWhatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-outline-variant text-on-surface px-md py-xs rounded-lg text-label-md font-semibold flex items-center gap-1 hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-green-600 text-[18px]">chat</span>
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right visual */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-xl relative bg-primary/5">
              {procedure.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={procedure.image} alt={procedure.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary/40" style={{ fontSize: 72 }}>medical_services</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-sm left-sm right-sm bg-white/70 backdrop-blur-md p-sm rounded-lg border border-white/20">
                <div className="flex items-center gap-sm">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-lg">
                    <Image src={doctor.profileImage} alt={doctor.name} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <div>
                    <div className="text-on-surface font-bold text-caption">{doctor.name}</div>
                    <div className="text-on-surface-variant text-[10px]">{doctor.specialization.join(" & ")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-[1280px] mx-auto px-gutter py-lg relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Content column */}
          <div className="lg:col-span-8 space-y-lg">
            {/* Quick info grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-sm">
              <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/30 hover:shadow-md transition-shadow">
                <span className="material-symbols-outlined text-primary mb-1 text-[20px] block">payments</span>
                <div className="text-caption text-on-surface-variant uppercase tracking-wider">Starting Price</div>
                <div className="text-body-lg font-bold text-on-surface">Rs. {procedure.pricePkr.toLocaleString()}</div>
                {hasDiscount && (
                  <div className="text-caption text-on-surface-variant/60 line-through">
                    Rs. {procedure.originalPricePkr!.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/30 hover:shadow-md transition-shadow">
                <span className="material-symbols-outlined text-primary mb-1 text-[20px] block">history</span>
                <div className="text-caption text-on-surface-variant uppercase tracking-wider">Duration</div>
                <div className="text-body-lg font-bold text-on-surface">~{procedure.durationMinutes} min</div>
              </div>
              <div className="bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/30 hover:shadow-md transition-shadow">
                <span className="material-symbols-outlined text-primary mb-1 text-[20px] block">healing</span>
                <div className="text-caption text-on-surface-variant uppercase tracking-wider">Recovery</div>
                <div className="text-body-lg font-bold text-on-surface">{procedure.recoveryTime || "—"}</div>
              </div>
            </div>

            {/* About */}
            {procedure.fullDescription && (
              <div>
                <h2 className="text-headline-md font-bold text-on-surface mb-xs">About the Procedure</h2>
                <div
                  className="text-body-md text-on-surface-variant leading-relaxed [&_ul]:list-disc [&_ul]:pl-lg [&_ol]:list-decimal [&_ol]:pl-lg [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-outline-variant [&_blockquote]:pl-sm [&_blockquote]:italic [&_p]:mb-sm last:[&_p]:mb-0"
                  // Sanitized server-side (sanitizeRichText) before it's ever persisted — see app/api/procedures routes.
                  dangerouslySetInnerHTML={{ __html: procedure.fullDescription }}
                />
              </div>
            )}

            {/* Benefits & Risks */}
            {(procedure.benefits.length > 0 || procedure.risks.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                {procedure.benefits.length > 0 && (
                  <div>
                    <h2 className="text-body-lg font-bold text-on-surface mb-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>Benefits
                    </h2>
                    <ul className="space-y-xs">
                      {procedure.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-xs bg-green-50 border border-green-100 p-xs rounded-lg">
                          <span className="material-symbols-outlined text-green-600 mt-0.5 text-[16px]">task_alt</span>
                          <span className="text-caption text-on-surface-variant">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {procedure.risks.length > 0 && (
                  <div>
                    <h2 className="text-body-lg font-bold text-on-surface mb-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber-600 text-[20px]">warning</span>Risks
                    </h2>
                    <ul className="space-y-xs">
                      {procedure.risks.map((r, i) => (
                        <li key={i} className="flex items-start gap-xs bg-amber-50 border border-amber-100 p-xs rounded-lg">
                          <span className="material-symbols-outlined text-amber-600 mt-0.5 text-[16px]">info</span>
                          <span className="text-caption text-on-surface-variant">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Preparation Instructions */}
            {procedure.preparationInstructions && (
              <div className="bg-primary/5 border border-primary/20 p-sm rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-sm opacity-10">
                  <span className="material-symbols-outlined text-[32px]">fact_check</span>
                </div>
                <h2 className="text-body-lg font-bold text-primary mb-xs">Preparation Instructions</h2>
                <div className="flex items-start gap-xs">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-[18px]">check_circle</span>
                  <p className="text-caption text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {procedure.preparationInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Available Clinics */}
            <div>
              <h2 className="text-headline-md font-bold text-on-surface mb-xs">Available Clinics</h2>
              {clinics.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">
                  This procedure isn&apos;t currently available for online booking. Please WhatsApp or call us.
                </p>
              ) : (
                <div className="space-y-xs">
                  {clinics.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-sm p-sm rounded-lg border border-outline-variant/30 bg-surface-container-lowest hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-sm">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                        </div>
                        <div>
                          <div className="font-bold text-body-md text-on-surface">{c.name}</div>
                          <div className="text-caption text-on-surface-variant">{c.address ?? c.city}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => bookAt(c)}
                        className="shrink-0 bg-primary text-on-primary px-sm py-1 rounded-lg text-caption font-semibold hover:opacity-90 transition-all"
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
                <h2 className="text-headline-md font-bold text-on-surface mb-xs">Frequently Asked Questions</h2>
                <div className="space-y-xs">
                  {procedure.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group bg-surface-container-lowest border border-outline-variant/30 rounded-lg overflow-hidden shadow-sm"
                      open={i === 0}
                    >
                      <summary className="flex justify-between items-center p-sm cursor-pointer list-none hover:bg-surface-container-low transition-colors">
                        <span className="font-bold text-body-md text-on-surface">{faq.question}</span>
                        <span className="material-symbols-outlined text-[20px] transition-transform group-open:rotate-180">expand_more</span>
                      </summary>
                      <div className="px-sm pb-sm text-caption text-on-surface-variant leading-relaxed">{faq.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-sm">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg overflow-hidden shadow-lg">
                {procedure.image && (
                  <div className="aspect-video w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={procedure.image} alt={procedure.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-sm">
                  <div className="mb-sm">
                    <h3 className="text-body-lg font-bold text-on-surface mb-1">{procedure.name}</h3>
                    <div className="flex items-center gap-1 text-primary font-bold text-body-lg">
                      Rs. {procedure.pricePkr.toLocaleString()}
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
                  <div className="space-y-1 mb-sm">
                    <div className="flex items-center justify-between text-caption py-1 border-b border-outline-variant/10">
                      <span className="text-on-surface-variant">Duration</span>
                      <span className="font-bold">~{procedure.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center justify-between text-caption py-1 border-b border-outline-variant/10">
                      <span className="text-on-surface-variant">Specialist</span>
                      <span className="font-bold">{doctor.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-caption py-1">
                      <span className="text-on-surface-variant">Clinics</span>
                      <span className="font-bold">{clinics.length > 0 ? `${clinics.length} available` : "Call us"}</span>
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <button
                      onClick={() => bookAt()}
                      className="w-full bg-primary text-on-primary py-xs rounded-lg text-label-md font-bold hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      Book Procedure
                    </button>
                    <a
                      href={`tel:${doctor.contactPhone}`}
                      className="w-full bg-surface-variant/30 border border-outline-variant/30 text-on-surface py-xs rounded-lg text-label-md font-bold flex items-center justify-center gap-1 hover:bg-surface-variant transition-all"
                    >
                      <span className="material-symbols-outlined text-green-600 text-[18px]">call</span>
                      Inquiry Helpline
                    </a>
                  </div>
                  <p className="text-center text-caption text-on-surface-variant/60 mt-sm">
                    Fully accredited clinical facility with modern infection control standards.
                  </p>
                </div>
              </div>

              <div className="bg-secondary-container/10 p-sm rounded-lg border border-secondary-container/20 flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-[28px]">verified_user</span>
                <div>
                  <div className="font-bold text-body-md text-on-surface">Patient Safety First</div>
                  <div className="text-caption text-on-surface-variant">Fully accredited, sterile procedure rooms with modern infection control.</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related Procedures — compact rows */}
      {related.length > 0 && (
        <section className="bg-surface-container-low py-lg">
          <div className="max-w-[1280px] mx-auto px-gutter">
            <div className="flex justify-between items-end mb-sm">
              <div>
                <h2 className="text-headline-md font-bold text-on-surface mb-1">Related Procedures</h2>
                <p className="text-caption text-on-surface-variant">Other gastroenterology services offered by {doctor.name}</p>
              </div>
              <Link href="/services" className="text-primary text-label-md font-bold flex items-center gap-1 hover:underline shrink-0">
                View All Services <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={p.slug ? `/procedures/${p.slug}` : "/services"}
                  className="flex flex-col bg-white p-sm rounded-lg border border-outline-variant/30 hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-28 w-full bg-surface-variant rounded-lg overflow-hidden mb-xs shrink-0">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-outline/20">
                        <span className="material-symbols-outlined text-[40px]">monitor_heart</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-body-md mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                  <p className="text-caption text-on-surface-variant mb-xs line-clamp-2">{p.shortDescription || p.location}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-primary font-bold text-body-md">Rs. {p.pricePkr.toLocaleString()}</span>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-lg">
        <div className="max-w-[1280px] mx-auto px-gutter">
          <div className="bg-primary rounded-xl p-lg text-center relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h2 className="text-headline-md font-bold text-on-primary mb-xs">Ready to prioritize your health?</h2>
              <p className="text-on-primary-container text-body-md mb-md max-w-xl mx-auto opacity-90">
                Book your consultation with {doctor.name} today for professional, compassionate, and precise gastrointestinal care.
              </p>
              <div className="flex flex-col sm:flex-row gap-xs justify-center">
                <button
                  onClick={() => bookAt()}
                  className="bg-white text-primary px-lg py-xs rounded-lg font-bold text-label-md hover:scale-105 transition-transform shadow-lg"
                >
                  Book Your Appointment
                </button>
                <a
                  href={`tel:${doctor.contactPhone}`}
                  className="bg-primary-container border border-on-primary/20 text-on-primary px-lg py-xs rounded-lg font-bold text-label-md hover:bg-primary-container/80 transition-all"
                >
                  Call Now: {doctor.contactPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
