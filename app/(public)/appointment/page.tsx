import { doctor } from "@/lib/data";
import ConditionsSearch from "@/components/public/ConditionsSearch";

export const metadata = {
  title: "Treatments & Conditions | Dr. Zaid Gul",
  description:
    "Advanced clinical solutions for digestive health. Browse all conditions treated and specialized procedures performed by Dr. Zaid Gul.",
};

export default function AppointmentPage() {
  const { conditions_treated, services } = doctor;

  return (
    <main className="pt-24 min-h-screen">
      {/* ── Hero ── */}
      <section
        className="pt-xl pb-16 px-gutter"
        style={{
          background: "radial-gradient(circle at top right, #dbe1ff 0%, #faf8ff 50%)",
        }}
      >
        <div className="max-w-[1280px] mx-auto text-center">
          <span className="inline-block bg-primary/10 text-primary px-sm py-xs rounded-full text-label-md font-semibold mb-md">
            Expert Gastrointestinal Care
          </span>
          <h1 className="text-display font-bold mb-md text-on-background">
            Treatments &amp; Conditions
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Advanced clinical solutions for digestive health, specializing in
            minimally invasive procedures and personalized therapeutic plans.
          </p>
        </div>
      </section>

      {/* Client-rendered search + grid + CTA */}
      <ConditionsSearch
        conditions={conditions_treated}
        services={services}
      />
    </main>
  );
}
