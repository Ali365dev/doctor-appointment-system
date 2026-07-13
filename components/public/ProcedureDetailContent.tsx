"use client";

import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";

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
}: {
  procedure: ProcedureDetail;
  clinics: ClinicOption[];
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
    }
    router.push(`/book-appointment/step-1?procedure=${procedure.id}`);
  };

  return (
    <main className="max-w-[1024px] mx-auto px-gutter py-16 pt-28 space-y-10">
      <header className="space-y-3">
        {procedure.image && (
          <img src={procedure.image} alt={procedure.name} className="w-full max-h-80 object-cover rounded-2xl" />
        )}
        <h1 className="text-headline-lg font-bold text-on-surface">{procedure.name}</h1>
        {procedure.shortDescription && (
          <p className="text-body-lg text-on-surface-variant">{procedure.shortDescription}</p>
        )}
        <div className="flex flex-wrap items-center gap-md pt-2">
          <span className="text-headline-md font-bold text-primary">
            From Rs. {procedure.pricePkr.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-body-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            ~{procedure.durationMinutes} min
          </span>
        </div>
      </header>

      {procedure.fullDescription && (
        <section>
          <h2 className="text-headline-md font-semibold mb-sm">About This Procedure</h2>
          <p className="text-body-md text-on-surface-variant whitespace-pre-line">{procedure.fullDescription}</p>
        </section>
      )}

      {(procedure.benefits.length > 0 || procedure.risks.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {procedure.benefits.length > 0 && (
            <div>
              <h3 className="text-headline-md font-semibold mb-sm text-green-700">Benefits</h3>
              <ul className="space-y-2">
                {procedure.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-green-600 text-[18px] mt-0.5">check_circle</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {procedure.risks.length > 0 && (
            <div>
              <h3 className="text-headline-md font-semibold mb-sm text-amber-700">Risks</h3>
              <ul className="space-y-2">
                {procedure.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">warning</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {(procedure.preparationInstructions || procedure.recoveryTime) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {procedure.preparationInstructions && (
            <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <h3 className="text-body-lg font-semibold mb-sm">Preparation Instructions</h3>
              <p className="text-body-md text-on-surface-variant whitespace-pre-line">
                {procedure.preparationInstructions}
              </p>
            </div>
          )}
          {procedure.recoveryTime && (
            <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <h3 className="text-body-lg font-semibold mb-sm">Recovery Time</h3>
              <p className="text-body-md text-on-surface-variant">{procedure.recoveryTime}</p>
            </div>
          )}
        </section>
      )}

      {procedure.faqs.length > 0 && (
        <section>
          <h2 className="text-headline-md font-semibold mb-sm">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {procedure.faqs.map((faq, i) => (
              <details key={i} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <summary className="font-semibold text-on-surface cursor-pointer">{faq.question}</summary>
                <p className="text-body-md text-on-surface-variant mt-2">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-headline-md font-semibold mb-sm">Available Clinics</h2>
        {clinics.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            This procedure isn&apos;t currently available for online booking. Please WhatsApp or call us.
          </p>
        ) : (
          <div className="space-y-3">
            {clinics.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest"
              >
                <div>
                  <p className="font-semibold text-on-surface">{c.name}</p>
                  <p className="text-caption text-on-surface-variant">{c.address ?? c.city}</p>
                </div>
                <button
                  onClick={() => bookAt(c)}
                  className="px-md py-xs rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-all"
                >
                  Book Here
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {clinics.length > 1 && (
        <div className="pt-4 border-t border-outline-variant/20">
          <button
            onClick={() => bookAt()}
            className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all"
          >
            Book Procedure
          </button>
        </div>
      )}
    </main>
  );
}
