import Image from "next/image";

interface BookingSidebarProps {
  visitTypeLabel: string | null;
}

export default function BookingSidebar({ visitTypeLabel }: BookingSidebarProps) {
  return (
    <aside className="lg:col-span-4 sticky top-28">
      <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/40">
        <h3 className="text-[24px] font-semibold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">
          Booking Summary
        </h3>

        <div className="space-y-6">
          {/* Specialist */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high border border-white flex-shrink-0">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE6Vt7p8SQmcDdFnAfSegrkMuMp4OpuBHevgfbaiIgL092BjsOGwlzzoqh57GRK1dXck3NK2hIPJo9WToPUd1V_tVno_JMZSixHuXQIA143wv9kUwCESR_i8QOiGc28PDrxMjjXDsAQkl9R8l3a8mDQbpohBxBYPnPVEU4nnZ_zDRT0WQjkunjovZH1i6vTBrmcvf1LBTkkakz9EL8mP8IbRiCzBnyYn40LYzjfBr88Iy2u2M1s59hZRWWwTJCpVTZwffv1Xd7Y-k"
                alt="Dr. Julian Sterling"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <span className="block text-[10px] text-outline font-bold uppercase tracking-tighter">
                Specialist
              </span>
              <span className="text-[14px] font-bold text-on-surface">Dr. Julian Sterling</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/20">
            <div
              className={`flex justify-between items-center transition-opacity ${
                visitTypeLabel ? "opacity-100" : "opacity-40"
              }`}
            >
              <span className="text-on-surface-variant">Visit Type</span>
              <span className={`text-[14px] font-bold ${!visitTypeLabel ? "italic" : ""}`}>
                {visitTypeLabel ?? "Not selected"}
              </span>
            </div>
            <div className="flex justify-between items-center opacity-40">
              <span className="text-on-surface-variant">Date &amp; Time</span>
              <span className="text-[14px] font-bold italic">Step 2</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <span className="font-bold text-on-surface">Total Amount</span>
              <span className="text-[24px] font-extrabold text-primary">$150.00</span>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-surface p-4 rounded-xl border border-dashed border-outline-variant">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <p className="text-[12px] text-on-surface-variant">
              Flexible cancellation policy. Change or cancel up to 24 hours before your appointment
              for a full refund.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
