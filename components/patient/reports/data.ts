export type ReportStatus = "pending" | "reviewing" | "replied" | "closed";
export type FileKind = "image" | "pdf";

export interface ReportFile {
  id: string;
  name: string;
  type: FileKind;
  size: string;
  url: string;
  thumbnail: string;
}

export type MessageSender = "patient" | "doctor" | "system";

export interface MessageAttachment {
  id: string;
  name: string;
  type: FileKind;
  url: string;
  thumbnail: string;
}

export interface Message {
  id: string;
  sender: MessageSender;
  message: string;
  attachments: MessageAttachment[];
  createdAt: string;
}

export interface DoctorReview {
  reviewedAt: string;
  summary: string;
  recommendations: string[];
  medicineChanges: string[];
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  doctor: { name: string; avatar: string } | null;
  appointment: { id: string; date: string; clinic: string } | null;
  files: ReportFile[];
  conversation: Message[];
  doctorReview: DoctorReview | null;
}

export const REPORT_CATEGORIES = [
  "Blood Test",
  "Imaging (X-Ray / MRI / CT)",
  "Prescription",
  "Endoscopy Report",
  "Ultrasound",
  "Other",
];

export const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string; icon: string }> = {
  pending: { label: "Pending Review", className: "bg-warning/10 text-warning", icon: "hourglass_empty" },
  reviewing: { label: "Doctor Reviewing", className: "bg-primary/10 text-primary", icon: "visibility" },
  replied: { label: "Doctor Replied", className: "bg-emerald-50 text-emerald-600", icon: "mark_chat_read" },
  closed: { label: "Closed", className: "bg-on-surface-variant/10 text-on-surface-variant", icon: "task_alt" },
};

const AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuBVFroceKentGX_zGpM9-kSeItLNGte67uw7a_iy8AVgJDxpncKJUShPW32MHwO_26oqWMbaNOmY8nH8hoWCZ5Fs334tjg1igym1in0KeISACyl951Fp6OZIwn92MQHIraVdZxDVy-MCoT2x3oNF0r7hc7AVu-u4A8cDDIqy2B2QZBA47CbRv9sRwGCLpVvJNyDUbf4Q7vJE7RDOpDOoZ7c6YN0Z_5w_m1CRS94Lhj2Mpd3nu-sQTE0yCzUsrIyXW13fiWdxe5MI-4";

const IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuATKh7hiy8TZrlatl7coiegFfTo9HoAC_1jitGOsiq5J1XrA4zgq0Df73ZwzgcXbLWSPgM0tWxJeO3K9C6bbchiiQAwLcvyrseEcx5z8zk2tuQT3lGRUttFCqj04J2nYFojMNsGTKNvtGq0MDY84W8UvOJVGBsv1cjWhAdyp6BF0qaZ8XdI5eQgSZ9g5fDUur3abZI9gvJ_J7AjgWQSjKVdt3kUL97F-Dh5DuWf5Pif9UT5HkHhIaDaSJLiIpcnmELrjWu7W6bhHIc";

export const MOCK_REPORTS: Report[] = [
  {
    id: "rep-1001",
    title: "Complete Blood Count (CBC)",
    description: "Routine blood work ordered after follow-up consultation.",
    category: "Blood Test",
    status: "replied",
    createdAt: "2026-06-28T09:15:00Z",
    updatedAt: "2026-06-30T14:02:00Z",
    doctor: { name: "Dr. Zaid Gul", avatar: AVATAR },
    appointment: { id: "apt-9042", date: "2026-06-25", clinic: "Chughtai Medical Centre" },
    files: [
      { id: "f-1", name: "cbc_report_page1.jpg", type: "image", size: "1.8 MB", url: IMG, thumbnail: IMG },
      { id: "f-2", name: "cbc_report_page2.pdf", type: "pdf", size: "640 KB", url: "#", thumbnail: "" },
    ],
    conversation: [
      { id: "m-1", sender: "patient", message: "Uploaded my latest CBC report, please review.", attachments: [], createdAt: "2026-06-28T09:16:00Z" },
      { id: "m-2", sender: "system", message: "Dr. Zaid Gul viewed this report.", attachments: [], createdAt: "2026-06-29T11:00:00Z" },
      { id: "m-3", sender: "doctor", message: "Your hemoglobin levels look good. Continue the iron supplement for two more weeks.", attachments: [], createdAt: "2026-06-30T14:02:00Z" },
    ],
    doctorReview: {
      reviewedAt: "2026-06-30T14:02:00Z",
      summary: "Overall CBC within normal range, mild improvement in hemoglobin since last test.",
      recommendations: ["Continue iron supplement", "Repeat CBC after 4 weeks", "Increase water intake"],
      medicineChanges: ["Iron supplement dosage unchanged"],
    },
  },
  {
    id: "rep-1002",
    title: "Abdominal Ultrasound",
    description: "Ultrasound scan for recurring abdominal pain.",
    category: "Ultrasound",
    status: "reviewing",
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-02T08:30:00Z",
    doctor: { name: "Dr. Zaid Gul", avatar: AVATAR },
    appointment: { id: "apt-8921", date: "2026-06-29", clinic: "Faisal Hospital (New Building)" },
    files: [
      { id: "f-3", name: "abdominal_us_scan.jpg", type: "image", size: "2.4 MB", url: IMG, thumbnail: IMG },
    ],
    conversation: [
      { id: "m-4", sender: "patient", message: "This is my ultrasound scan from yesterday.", attachments: [], createdAt: "2026-07-01T10:01:00Z" },
      { id: "m-5", sender: "system", message: "Dr. Zaid Gul is reviewing this report.", attachments: [], createdAt: "2026-07-02T08:30:00Z" },
    ],
    doctorReview: null,
  },
  {
    id: "rep-1003",
    title: "Prescription Refill – Omeprazole",
    description: "Requesting a refill and dosage review for acidity medication.",
    category: "Prescription",
    status: "pending",
    createdAt: "2026-07-03T16:20:00Z",
    updatedAt: "2026-07-03T16:20:00Z",
    doctor: null,
    appointment: null,
    files: [
      { id: "f-4", name: "current_prescription.jpg", type: "image", size: "980 KB", url: IMG, thumbnail: IMG },
      { id: "f-5", name: "medicine_bottle.jpg", type: "image", size: "1.1 MB", url: IMG, thumbnail: IMG },
    ],
    conversation: [
      { id: "m-6", sender: "patient", message: "Can I get this prescription refilled? Still experiencing mild acidity.", attachments: [], createdAt: "2026-07-03T16:21:00Z" },
    ],
    doctorReview: null,
  },
  {
    id: "rep-1004",
    title: "Chest X-Ray",
    description: "X-ray taken for persistent cough evaluation.",
    category: "Imaging (X-Ray / MRI / CT)",
    status: "closed",
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-06-14T12:00:00Z",
    doctor: { name: "Dr. Zaid Gul", avatar: AVATAR },
    appointment: { id: "apt-8755", date: "2026-06-08", clinic: "Chughtai Medical Centre" },
    files: [
      { id: "f-6", name: "chest_xray.jpg", type: "image", size: "2.1 MB", url: IMG, thumbnail: IMG },
    ],
    conversation: [
      { id: "m-7", sender: "patient", message: "Attaching my chest X-ray as advised.", attachments: [], createdAt: "2026-06-10T09:01:00Z" },
      { id: "m-8", sender: "doctor", message: "X-ray is clear, no signs of infection. Cough should resolve within a week.", attachments: [], createdAt: "2026-06-14T12:00:00Z" },
      { id: "m-9", sender: "system", message: "This report has been closed.", attachments: [], createdAt: "2026-06-14T12:05:00Z" },
    ],
    doctorReview: {
      reviewedAt: "2026-06-14T12:00:00Z",
      summary: "Lungs clear, no consolidation or effusion detected.",
      recommendations: ["No further imaging needed", "Follow up only if symptoms persist beyond 10 days"],
      medicineChanges: [],
    },
  },
  {
    id: "rep-1005",
    title: "Liver Function Test",
    description: "LFT ordered as part of routine hepatology follow-up.",
    category: "Blood Test",
    status: "replied",
    createdAt: "2026-06-20T08:00:00Z",
    updatedAt: "2026-06-22T09:40:00Z",
    doctor: { name: "Dr. Zaid Gul", avatar: AVATAR },
    appointment: { id: "apt-8801", date: "2026-06-18", clinic: "Faisal Hospital (New Building)" },
    files: [
      { id: "f-7", name: "lft_report.pdf", type: "pdf", size: "512 KB", url: "#", thumbnail: "" },
    ],
    conversation: [
      { id: "m-10", sender: "patient", message: "Sharing my LFT results from this week.", attachments: [], createdAt: "2026-06-20T08:05:00Z" },
      { id: "m-11", sender: "doctor", message: "Enzyme levels have improved significantly. Keep avoiding fried food.", attachments: [], createdAt: "2026-06-22T09:40:00Z" },
    ],
    doctorReview: {
      reviewedAt: "2026-06-22T09:40:00Z",
      summary: "ALT/AST trending down toward normal range.",
      recommendations: ["Maintain low-fat diet", "Repeat LFT in 6 weeks"],
      medicineChanges: ["Hepatoprotective dose reduced to once daily"],
    },
  },
];

export function getReportById(id: string): Report | undefined {
  return MOCK_REPORTS.find((r) => r.id === id);
}

export function getRecentReports(limit = 5): Report[] {
  return [...MOCK_REPORTS]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}
