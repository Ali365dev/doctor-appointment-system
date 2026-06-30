import Image from "next/image";

export default function LoginHero() {
  return (
    <section className="hidden lg:flex lg:w-1/2 relative bg-primary-container items-center justify-center p-16">

      <div className="relative z-10 glass-card p-16 rounded-xl border border-white/20 shadow-2xl max-w-[450px]">
        <div className="flex items-center gap-4 mb-4">
          <span className="material-symbols-outlined text-primary text-4xl">
            medical_services
          </span>
          <h1 className="text-title-lg font-semibold text-primary tracking-tight">
            Dr. Specialist
          </h1>
        </div>

        <h2 className="text-headline-1 font-bold text-text mb-4 leading-none tracking-tight">
          Trust, Care, and Clinical Excellence
        </h2>

        <p className="text-body-lg text-text-secondary leading-relaxed">
          Providing world-class specialized care with a human touch. Join our
          community of wellness.
        </p>

        <div className="mt-10 flex gap-4">
          <div className="flex flex-col">
            <span className="text-title-lg font-semibold text-primary">
              15k+
            </span>
            <span className="text-label-lg font-semibold text-text-secondary tracking-wider">
              Patients Treated
            </span>
          </div>
          <div className="h-12 w-px bg-outline-variant/30" />
          <div className="flex flex-col">
            <span className="text-title-lg font-semibold text-primary">
              4.9/5
            </span>
            <span className="text-label-lg font-semibold text-text-secondary tracking-wider">
              Global Rating
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
