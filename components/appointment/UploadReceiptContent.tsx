"use client";

import { useState, useRef, useEffect, DragEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import { useBookingStore } from "@/store/bookingStore";
import { doctor as staticDoctor } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";
import { uploadWithProgress } from "@/lib/uploadWithProgress";

type UploadState = "idle" | "uploading" | "done" | "error";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface AppointmentSummary {
  clinicName: string;
  procedureName?: string;
  date: string;
  time: string;
  feeSnapshotPkr: number;
  appointmentNumber: string;
}

export default function UploadReceiptContent() {
  const doctor = useDoctorProfile();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    selectedClinic,
    selectedProcedure,
    selectedDate,
    selectedTime,
    appointmentId: storeAppointmentId,
    appointmentNumber: storeAppointmentNumber,
    paymentMethod: storePaymentMethod,
  } = useBookingStore();

  // Falls back to the URL when arriving from "Upload New Receipt" on the
  // dashboard (a rejected payment retry) rather than the live booking flow —
  // the Zustand store may be empty in that case.
  const appointmentId = storeAppointmentId ?? searchParams.get("appointmentId");
  const paymentMethod = storePaymentMethod ?? (searchParams.get("method") as "jazzcash" | "easypaisa" | null);

  const [remoteSummary, setRemoteSummary] = useState<AppointmentSummary | null>(null);

  useEffect(() => {
    if (selectedClinic || !appointmentId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}/confirmation`);
        const data = await res.json();
        if (!cancelled && res.ok) {
          setRemoteSummary({
            clinicName: data.confirmation.clinicName,
            procedureName: data.confirmation.procedureName,
            date: data.confirmation.date,
            time: data.confirmation.time,
            feeSnapshotPkr: data.confirmation.feeSnapshotPkr,
            appointmentNumber: data.confirmation.appointmentNumber,
          });
        }
      } catch {
        // Non-fatal — summary panel just falls back to placeholders.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only needs to run once per appointmentId when the store has no clinic data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const fee = selectedProcedure?.pricePkr ?? selectedClinic?.fee_pkr ?? remoteSummary?.feeSnapshotPkr ?? staticDoctor.fee_summary.min_fee_pkr;
  const clinicLabel = selectedClinic?.name ?? remoteSummary?.clinicName ?? "—";
  const procedureName = selectedProcedure?.name ?? remoteSummary?.procedureName ?? null;
  const dateValue = selectedDate ?? remoteSummary?.date ?? null;
  const timeLabel = selectedTime ?? remoteSummary?.time ?? "—";
  const appointmentNumber = storeAppointmentNumber ?? remoteSummary?.appointmentNumber;

  const formattedDate = dateValue
    ? new Date(dateValue + "T00:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only JPG, PNG, or PDF files are accepted.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "File must be 5 MB or smaller.";
    }
    return null;
  }

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }
    if (!appointmentId || !paymentMethod || (paymentMethod !== "jazzcash" && paymentMethod !== "easypaisa")) {
      toast.error("Missing booking details — please restart the payment step.");
      return;
    }

    setFileName(file.name);
    setIsPdf(file.type === "application/pdf");
    setFilePreview(file.type === "application/pdf" ? null : URL.createObjectURL(file));
    setErrorMessage("");
    setUploadState("uploading");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("appointmentId", appointmentId);
      formData.append("method", paymentMethod);
      formData.append("file", file);

      const result = await uploadWithProgress<{ error?: string }>(
        "/api/receipts/upload",
        formData,
        setProgress
      );

      if (!result.ok) {
        setUploadState("error");
        setErrorMessage(result.data.error ?? "Upload failed. Please try again.");
        toast.error(result.data.error ?? "Upload failed. Please try again.");
        return;
      }

      setUploadState("done");
    } catch {
      setUploadState("error");
      setErrorMessage("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setUploadState("idle");
    setFileName(null);
    setErrorMessage("");
    setProgress(0);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setIsPdf(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleContinue = () => {
    router.push(
      `/book-appointment/success?payment=${paymentMethod ?? "receipt"}&appointmentId=${appointmentId ?? ""}`
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 md:p-10 shadow-sm border border-outline-variant/30">
          <h1 className="text-headline-lg font-bold text-on-surface mb-2">Submit Payment Receipt</h1>
          <p className="text-body-md text-on-surface-variant mb-10">
            Please upload a clear image or PDF of your bank transfer receipt to complete your
            appointment booking with {doctor.name}.
          </p>

          {/* Drop Zone */}
          <div
            onClick={() => uploadState === "idle" && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`rounded-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : uploadState === "idle"
                ? "border-outline-variant hover:bg-surface-container-low hover:border-primary/50"
                : "border-outline-variant/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={onFileChange}
            />

            {uploadState === "idle" && (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-[40px]">cloud_upload</span>
                </div>
                <h3 className="text-headline-md font-semibold text-on-surface mb-2">
                  Drag &amp; Drop file here
                </h3>
                <p className="text-body-md text-on-surface-variant mb-6">or click to browse your computer</p>
                <div className="flex gap-2">
                  {["JPG", "PNG", "PDF"].map((ext) => (
                    <span key={ext} className="bg-surface-container-high px-3 py-1 rounded-full text-[14px] font-semibold text-on-surface-variant">
                      {ext}
                    </span>
                  ))}
                </div>
                <p className="text-caption text-outline mt-6">Max file size 10 MB</p>
              </>
            )}

            {uploadState === "uploading" && (
              <div className="flex flex-col items-center py-4 w-full max-w-xs">
                {filePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={filePreview} alt="Receipt preview" className="max-h-32 rounded-lg mb-4 object-contain" />
                )}
                {isPdf && (
                  <span className="material-symbols-outlined text-primary text-[40px] mb-2">picture_as_pdf</span>
                )}
                <p className="text-headline-md font-semibold text-on-surface mb-3">
                  Uploading {fileName}…
                </p>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-caption text-on-surface-variant mt-2">{progress}%</p>
              </div>
            )}

            {uploadState === "done" && (
              <div className="flex flex-col items-center py-4">
                {filePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={filePreview} alt="Receipt preview" className="max-h-32 rounded-lg mb-4 object-contain" />
                )}
                {isPdf && (
                  <span className="material-symbols-outlined text-primary text-[40px] mb-2">picture_as_pdf</span>
                )}
                <span
                  className="material-symbols-outlined text-green-600 text-[48px] mb-2"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <p className="text-headline-md font-semibold text-on-surface">
                  {fileName} uploaded successfully
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="mt-4 text-primary text-[14px] font-semibold hover:underline"
                >
                  Remove and re-upload
                </button>
              </div>
            )}

            {uploadState === "error" && (
              <div className="flex flex-col items-center py-4">
                <span className="material-symbols-outlined text-error text-[48px] mb-2">error</span>
                <p className="text-headline-md font-semibold text-on-surface">Upload failed</p>
                <p className="text-body-md text-error mt-1">{errorMessage}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="mt-4 text-primary text-[14px] font-semibold hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="mt-10 flex gap-6 bg-secondary-fixed/30 border border-secondary/10 p-6 rounded-xl">
            <span className="material-symbols-outlined text-secondary shrink-0">info</span>
            <p className="text-body-md text-on-surface leading-relaxed">
              Ensure the receipt includes the <strong>Transaction Reference</strong>,{" "}
              <strong>Amount (Rs. {fee.toLocaleString()})</strong>, and <strong>Date</strong>.
              Standard verification time is 1–2 hours.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-end">
            <button
              onClick={() => router.push(selectedClinic ? "/book-appointment/step-5" : "/patient/appointments")}
              className="px-10 py-3 rounded-lg border border-outline-variant text-[14px] font-semibold text-primary hover:bg-surface-container-high/50 transition-all"
            >
              {selectedClinic ? "Back to Payment" : "Back to Appointments"}
            </button>
            <button
              onClick={handleContinue}
              disabled={uploadState !== "done"}
              className={`px-16 py-3 rounded-lg bg-primary text-on-primary text-[14px] font-semibold shadow-md hover:brightness-110 active:scale-[0.98] transition-all ${
                uploadState !== "done" ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              Continue to Verify
            </button>
          </div>
        </div>
      </div>

      {/* Right: Summary */}
      <aside className="lg:col-span-4 lg:sticky lg:top-24">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-outline-variant/20">
            <h2 className="text-headline-md font-semibold text-on-surface">Appointment Summary</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-surface-container shadow-inner overflow-hidden shrink-0">
                <Image
                  src={doctor.profileImage}
                  alt={doctor.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-primary mb-1 uppercase tracking-wider">
                  {doctor.specialization[0]}
                </p>
                <p className="text-headline-md font-semibold text-on-surface">{doctor.name}</p>
                {appointmentNumber && (
                  <p className="text-caption text-on-surface-variant">#{appointmentNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-outline-variant/10">
              {[
                ...(procedureName ? [{ icon: "medical_services", label: "Procedure", value: procedureName }] : []),
                { icon: "location_on", label: "Clinic", value: clinicLabel },
                { icon: "calendar_today", label: "Date", value: formattedDate },
                { icon: "schedule", label: "Time", value: timeLabel },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-body-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    {label}
                  </span>
                  <span className="text-on-surface font-bold text-right max-w-[55%] truncate">{value}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-2 border-t border-outline-variant/30 flex justify-between items-center">
              <span className="text-headline-md font-semibold text-on-surface">Total Amount</span>
              <span className="text-primary text-[28px] font-bold">Rs. {fee.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <p className="text-caption text-on-surface-variant italic">
            By submitting your receipt, you agree to our payment terms. Your appointment stays
            pending until our team verifies the payment.
          </p>
        </div>
      </aside>
    </div>
  );
}
