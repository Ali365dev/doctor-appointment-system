import UploadReceiptContent from "@/components/appointment/UploadReceiptContent";

export const metadata = {
  title: "Upload Payment Receipt | Dr. Specialist",
  description: "Upload your payment receipt to complete your booking.",
};

export default function UploadReceiptPage() {
  return (
    <main className="grow w-full max-w-[1280px] mx-auto px-gutter py-10 md:py-16 pt-28">
      {/* Mini stepper: Upload → Verify */}
      <div className="max-w-4xl mx-auto mb-10 flex items-center justify-center">
        <div className="flex items-center w-full max-w-md">
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-md">
              1
            </div>
            <span className="text-[14px] font-bold mt-2 text-primary">Upload</span>
          </div>
          <div className="h-[2px] flex-1 bg-surface-container-highest mx-2 mb-6" />
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold">
              2
            </div>
            <span className="text-[14px] font-semibold mt-2 text-on-surface-variant">Verify</span>
          </div>
        </div>
      </div>

      <UploadReceiptContent />
    </main>
  );
}
