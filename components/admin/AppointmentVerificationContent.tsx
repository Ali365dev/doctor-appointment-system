"use client";

import Image from "next/image";
import { useState } from "react";

export default function AppointmentVerificationContent() {
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(false);

  function handleScan() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setVerified(true);
    }, 1500);
  }

  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="mb-xl">
        <h2 className="text-headline-lg font-bold text-on-surface">Appointment Verification</h2>
        <p className="text-body-lg text-on-surface-variant">Scan the patient&apos;s QR code or search by Appointment ID to verify check-in.</p>
      </div>

      {/* Scanner + Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-xl">
        {/* QR Scanner Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm relative group">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
              <h3 className="text-headline-md font-semibold text-on-surface">Scan QR Code</h3>
            </div>
            <button className="p-xs rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">flashlight_on</span>
            </button>
          </div>
          <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center border border-neutral-800">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-neutral-700 to-neutral-900" />
            <div className="relative w-48 h-48 border-2 border-white/50 rounded-2xl flex items-center justify-center">
              {scanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-b from-transparent via-primary to-transparent animate-[scan_1.5s_linear_once]" />
              )}
              {["-top-1 -left-1 border-t-4 border-l-4","-top-1 -right-1 border-t-4 border-r-4","-bottom-1 -left-1 border-b-4 border-l-4","-bottom-1 -right-1 border-b-4 border-r-4"].map((cls,i) => (
                <div key={i} className={`absolute w-6 h-6 border-primary ${cls}`} />
              ))}
            </div>
          </div>
          <div className="mt-md flex justify-center">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="bg-primary text-on-primary text-label-md px-lg py-sm rounded-lg hover:brightness-110 transition-all flex items-center gap-xs disabled:opacity-70"
            >
              {scanning
                ? <><span className="material-symbols-outlined animate-spin">sync</span> Processing...</>
                : <><span className="material-symbols-outlined text-[20px]">videocam</span> Start Scanner</>
              }
            </button>
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col">
          <div className="flex items-center gap-xs mb-md">
            <span className="material-symbols-outlined text-primary">search_check</span>
            <h3 className="text-headline-md font-semibold text-on-surface">Search Appointment</h3>
          </div>
          <div className="space-y-md flex-grow">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-xs">Appointment ID or Patient Details</label>
              <input className="w-full border border-outline rounded-lg h-12 px-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-md" placeholder="APT-2023-8942 or John Doe" type="text" />
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Phone Number</label>
                <input className="w-full border border-outline rounded-lg h-12 px-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="+1 (555) 000-0000" type="tel" />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Patient DOB</label>
                <input className="w-full border border-outline rounded-lg h-12 px-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" type="date" />
              </div>
            </div>
          </div>
          <div className="mt-xl">
            <button onClick={() => setVerified(true)} className="w-full border border-primary text-primary text-label-md h-12 rounded-lg hover:bg-primary/5 transition-all">
              Search Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result */}
      {verified && (
        <>
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-md flex items-center gap-md mb-gutter">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200 shrink-0">
              <span className="material-symbols-outlined text-white text-[28px]">check</span>
            </div>
            <div>
              <h4 className="text-headline-md text-green-900">Appointment Successfully Verified</h4>
              <p className="text-body-md text-green-700">Patient identity and payment status have been validated.</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden">
            <div className="p-lg grid grid-cols-1 lg:grid-cols-3 gap-xl">
              {/* Patient Identity */}
              <div className="lg:col-span-1 border-r border-outline-variant/50 pr-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden mb-md border-4 border-surface-container shadow-sm">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQgKUu2Yj5BaDaNIcmAWuGok4Ot7yyYffZTTJaMiJah-4Dxgc2ypIYMkBqhohpybQTg3yljVvzrwo7jPJtvKt9FN120SHj0xfzrLDhyZt1gpnnLQTRH3lXuFI24bbqfSkOoXzhbmRqhj5OAdTDei2k14McZ4CQJGCz-6j29_t6Lk8bra1Uw8vqOC1PHWVgcPFbWmPN95BQjJODH0JT3Yjil8u4H00OzTjisKbVi6l3qZ2r0n_UpFs--WfrWNaiP0ClGc1-jxKRvyI"
                      alt="Alexander Mitchell" width={128} height={128}
                      className="w-full h-full object-cover" unoptimized
                    />
                  </div>
                  <h3 className="text-headline-md text-on-surface">Alexander Mitchell</h3>
                  <p className="text-body-md text-primary font-medium">APT-2023-8942</p>
                  <div className="mt-md space-y-sm w-full">
                    {[["Date","Oct 24, 2023"],["Time","10:30 AM - 11:15 AM"],["Type","Initial Consultation"],["Payment","Verified ✓"]].map(([label,val]) => (
                      <div key={label} className="flex justify-between items-center text-caption py-xs border-b border-outline-variant/30 last:border-0">
                        <span className="text-on-surface-variant uppercase tracking-wider">{label}</span>
                        <span className={`text-on-surface font-semibold ${label==="Payment"?"text-green-600":""}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Journey */}
              <div className="lg:col-span-2">
                {/* Timeline */}
                <h4 className="text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Appointment Timeline</h4>
                <div className="relative flex justify-between items-center mb-xl">
                  <div className="absolute h-1 bg-surface-container left-0 right-0 top-1/2 -translate-y-1/2 z-0" />
                  <div className="absolute h-1 bg-primary left-0 w-3/4 top-1/2 -translate-y-1/2 z-0" />
                  {[["done","Booked"],["done","Paid"],["done","Confirmed"]].map(([icon, label]) => (
                    <div key={label} className="relative z-10 flex flex-col items-center gap-xs">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>
                      </div>
                      <span className="text-caption font-bold text-on-surface">{label}</span>
                    </div>
                  ))}
                  <div className="relative z-10 flex flex-col items-center gap-xs">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center ring-4 ring-primary-container/20">
                      <span className="material-symbols-outlined">how_to_reg</span>
                    </div>
                    <span className="text-caption font-bold text-primary">Checked In</span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-xs">
                    <div className="w-8 h-8 rounded-full bg-surface-container text-outline flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
                    </div>
                    <span className="text-caption font-bold text-on-surface-variant">Completed</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-md mt-xl">
                  <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
                    <h5 className="text-label-md text-on-surface-variant mb-xs">Medical Reason</h5>
                    <p className="text-body-md text-on-surface font-medium">Acute recurring chest tightness and shortness of breath during physical exertion.</p>
                  </div>
                  <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
                    <h5 className="text-label-md text-on-surface-variant mb-xs">Insurance Provider</h5>
                    <p className="text-body-md text-on-surface font-medium">BlueCross Elite Platinum • ID: 9812-7364-00</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-xl flex flex-wrap gap-sm">
                  <button className="bg-primary text-on-primary text-label-md h-12 px-lg rounded-lg shadow-sm hover:brightness-110 flex items-center gap-xs transition-all">
                    <span className="material-symbols-outlined">check_circle</span> Check-In Patient
                  </button>
                  <button className="border border-outline-variant text-on-surface text-label-md h-12 px-md rounded-lg hover:bg-surface-container transition-all flex items-center gap-xs">
                    <span className="material-symbols-outlined">stethoscope</span> Start Consultation
                  </button>
                  <button className="border border-outline-variant text-on-surface text-label-md h-12 px-md rounded-lg hover:bg-surface-container transition-all flex items-center gap-xs">
                    <span className="material-symbols-outlined">chat_bubble</span> Open Patient Chat
                  </button>
                  <button className="ml-auto text-error text-label-md h-12 px-md rounded-lg hover:bg-error/5 transition-all flex items-center gap-xs">
                    <span className="material-symbols-outlined">flag</span> Mark Discrepancy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
