"use client";

import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBookingStore } from "@/store/bookingStore";
import { doctor } from "@/lib/data";

type UploadState = "idle" | "uploading" | "done";

export default function UploadReceiptContent() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { selectedClinic, selectedDate, selectedTime, setReceiptUploaded } = useBookingStore();

  const fee = selectedClinic?.fee_pkr ?? doctor.fee_summary.min_fee_pkr;

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";

  const handleFile = (file: File) => {
    setFileName(file.name);
    setUploadState("uploading");
    setTimeout(() => {
      setUploadState("done");
      setReceiptUploaded(true);
    }, 1500);
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
    setReceiptUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
              </>
            )}

            {uploadState === "uploading" && (
              <div className="flex flex-col items-center py-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-headline-md font-semibold text-on-surface">
                  Uploading {fileName}…
                </p>
              </div>
            )}

            {uploadState === "done" && (
              <div className="flex flex-col items-center py-4">
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
              onClick={() => router.push("/book-appointment/step-5")}
              className="px-10 py-3 rounded-lg border border-outline-variant text-[14px] font-semibold text-primary hover:bg-surface-container-high/50 transition-all"
            >
              Back to Payment
            </button>
            <button
              onClick={() => router.push("/book-appointment/success")}
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
                  src={doctor.profile_image}
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
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-outline-variant/10">
              {[
                { icon: "location_on", label: "Clinic", value: selectedClinic?.name ?? "—" },
                { icon: "calendar_today", label: "Date", value: formattedDate },
                { icon: "schedule", label: "Time", value: selectedTime ?? "—" },
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
            By submitting your receipt, you agree to our payment terms. Your slot is held for
            15 minutes while you complete this upload.
          </p>
        </div>
      </aside>
    </div>
  );
}
