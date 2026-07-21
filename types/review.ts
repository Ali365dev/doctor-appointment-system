export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface ReviewDoctorReply {
  message: string;
  repliedAt: string;
}

export interface Review {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  appointmentNumber: string;
  appointmentDate: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  doctorReply: ReviewDoctorReply | null;
  createdAt: string;
}

export const REVIEW_STATUS_META: Record<ReviewStatus, { label: string; badgeClass: string }> = {
  pending: { label: "Pending", badgeClass: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", badgeClass: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", badgeClass: "bg-error/10 text-error" },
};
