const steps = [
  { number: 1, label: "Appointment" },
  { number: 2, label: "Date & Time" },
  { number: 3, label: "Details" },
  { number: 4, label: "Review" },
  { number: 5, label: "Payment" },
];

interface BookingStepperProps {
  currentStep: number;
}

export default function BookingStepper({ currentStep }: BookingStepperProps) {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-3xl mx-auto relative">
        {/* Background connector line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-outline-variant/30 z-0" />
        {/* Progress line */}
        <div
          className="absolute top-5 left-0 h-[2px] bg-primary z-0 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />

        {steps.map((step) => (
          <div
            key={step.number}
            className="relative z-10 flex flex-col items-center gap-2 bg-background px-2"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step.number < currentStep
                  ? "bg-primary text-on-primary"
                  : step.number === currentStep
                  ? "bg-surface-container-lowest border-2 border-primary text-primary ring-4 ring-primary/10"
                  : "bg-surface-container-highest border-2 border-outline-variant text-outline"
              }`}
            >
              {step.number < currentStep ? (
                <span className="material-symbols-outlined text-[20px]">check</span>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-caption font-semibold ${
                step.number === currentStep ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
