import Image from "next/image";
import { DoctorReview, formatDateTime } from "./data";

interface DoctorSummaryCardProps {
  doctor: { name: string; avatar: string };
  review: DoctorReview;
}

export default function DoctorSummaryCard({ doctor, review }: DoctorSummaryCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-md md:p-lg shadow-sm space-y-md">
      <div className="flex items-center gap-sm">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
          <Image src={doctor.avatar} alt={doctor.name} width={48} height={48} className="w-full h-full object-cover" unoptimized />
        </div>
        <div>
          <h3 className="text-label-md font-bold text-on-surface">{doctor.name}</h3>
          <p className="text-caption text-on-surface-variant">Reviewed on {formatDateTime(review.reviewedAt)}</p>
        </div>
      </div>

      <div>
        <p className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Summary</p>
        <p className="text-body-md text-on-surface">{review.summary}</p>
      </div>

      {review.recommendations.length > 0 && (
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Recommendations</p>
          <ul className="space-y-1">
            {review.recommendations.map((r) => (
              <li key={r} className="flex items-start gap-2 text-body-md text-on-surface">
                <span className="material-symbols-outlined text-primary text-body-lg shrink-0">check_circle</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.medicineChanges.length > 0 && (
        <div>
          <p className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Medicine Changes</p>
          <ul className="space-y-1">
            {review.medicineChanges.map((m) => (
              <li key={m} className="flex items-start gap-2 text-body-md text-on-surface">
                <span className="material-symbols-outlined text-secondary text-body-lg shrink-0">medication</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
