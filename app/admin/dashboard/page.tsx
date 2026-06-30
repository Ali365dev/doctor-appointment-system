import Image from "next/image";

export const metadata = { title: "Overview | MedClinical" };

const scheduleItems = [
  { time: "09:00", period: "AM", name: "Eleanor Shellstrop", detail: "Routine Check-up • Room 402", status: "Confirmed", statusClass: "bg-secondary/10 text-secondary" },
  { time: "10:30", period: "AM", name: "Tahani Al-Jamil", detail: "Consultation • Virtual Room", status: "In-Progress", statusClass: "bg-tertiary/10 text-tertiary" },
  { time: "01:15", period: "PM", name: "Chidi Anagonye", detail: "Medical Review • Room 201", status: "Upcoming", statusClass: "bg-surface-container-highest text-on-surface-variant" },
];

const activityItems = [
  { icon: "person_add", color: "border-primary", title: "Patient Arrival", desc: "Michael Scott checked in for 09:30 slot", ago: "2 minutes ago" },
  { icon: "upload_file", color: "border-secondary", title: "Payment Upload", desc: "Insurance clearance for Invoice #8841", ago: "1 hour ago" },
  { icon: "clinical_notes", color: "border-tertiary", title: "New Lab Record", desc: "CT Scan results attached to Patient #442", ago: "4 hours ago" },
];

const calendarDays = [
  [null, null, null, null, null, null, 1],
  [2, 3, 4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22],
  [23, 24, 25, 26, 27, 28, 29],
  [30, null, null, null, null, null, null],
];

export default function DashboardOverviewPage() {
  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      {/* Page title */}
      <h1 className="text-headline-md font-bold text-primary mb-lg">Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-xs hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-label-md">Today&apos;s Appointments</span>
            <span className="p-xs bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">event</span>
            </span>
          </div>
          <span className="text-headline-lg font-bold">14</span>
          <span className="text-caption text-secondary font-medium">8 completed</span>
        </div>
        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-xs hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-label-md">Pending Requests</span>
            <span className="p-xs bg-tertiary/10 rounded-lg text-tertiary">
              <span className="material-symbols-outlined">pending_actions</span>
            </span>
          </div>
          <span className="text-headline-lg font-bold">6</span>
          <span className="text-caption text-on-surface-variant">4 urgent referrals</span>
        </div>
        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-xs hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-label-md">Total Revenue</span>
            <span className="p-xs bg-secondary/10 rounded-lg text-secondary">
              <span className="material-symbols-outlined">trending_up</span>
            </span>
          </div>
          <span className="text-headline-lg font-bold">$12,450</span>
          <div className="h-8 w-full opacity-60">
            <svg className="w-full h-full" viewBox="0 0 100 20">
              <path d="M0 15 Q 10 5, 20 12 T 40 8 T 60 14 T 80 5 T 100 10" fill="none" stroke="#2563EB" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-xs hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-label-md">New Patients</span>
            <span className="p-xs bg-surface-container-high rounded-lg text-on-surface">
              <span className="material-symbols-outlined">person_add</span>
            </span>
          </div>
          <span className="text-headline-lg font-bold">32</span>
          <span className="text-caption text-secondary font-medium">+12% from last month</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl items-start">
        {/* Left: Schedule + CMS */}
        <div className="lg:col-span-2 flex flex-col gap-xl">
          {/* Today's Schedule */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="px-md py-sm border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="text-headline-md font-semibold">Today&apos;s Schedule</h3>
              <button className="text-primary text-label-md hover:underline">View Full Calendar</button>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {scheduleItems.map((item) => (
                <div key={item.name} className="px-md py-sm flex items-center justify-between hover:bg-surface-container/50 transition-colors">
                  <div className="flex items-center gap-md">
                    <div className="text-center min-w-[60px]">
                      <div className="text-label-md text-on-surface">{item.time}</div>
                      <div className="text-caption text-on-surface-variant">{item.period}</div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-label-md text-on-surface">{item.name}</span>
                      <span className="text-caption text-on-surface-variant">{item.detail}</span>
                    </div>
                  </div>
                  <span className={`px-xs py-[2px] ${item.statusClass} text-[10px] rounded-full font-bold uppercase tracking-wider`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Portal Content */}
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm">
            <div className="flex justify-between items-center mb-md">
              <h3 className="text-headline-md font-semibold">Patient Portal Content</h3>
              <button className="text-primary text-label-md">Edit Articles</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {[
                { title: "Health Guide: Post-Op Care", sub: "Updated 2 days ago", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMtPGrCWUb9-aFp-TDgqSxkP5nagvUaR0MkgLWJQrR9rjp8CYG76MsMP8yoUBdOI2w06k4j9G7r2p0pAMmjiaLj7FWp_th2lNmpbcKlCGpnGP4XWbrQzYgY33WjbQVMvX8X10iAd3PJah1_Hp-H_6NiYHmk0nUAR7aZBqFNyhvXZeVMJY44pEEkeePRxyw8qY8TcncQq1CB3f1sBCniEeJWY7sFI9-I4St48R7e7g7-EvLZewpU2oZ3PQqdveFOOQRSZpOD_IXoYY" },
                { title: "Understanding Lab Results", sub: "Published last week", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWGFjrIjAjDgbO-M7YUpqa_daJ6DTjJ1y9htxluHyrcg5oGMMhE3OQSIL6yFrOrwrQS-0zkUZLKYTGUV5-pcikDikQJKLq11yD5btJ9NAQLd5RCarJtlKSu6CalhjgaBz4oqOKtg2ONZuPbQRGMlNBGjk-DfRSBg63Ru7-m0bXdHMJ8ivmyWpOmkDTfkqkhSFuVoj9m9GY3hc6AR2SimWzzIvAl9CDL2SiCJUKUoDs1j5fV966EmW9EckU9GCTJ7aSsC_3q8qQAus" },
              ].map((item) => (
                <div key={item.title} className="p-sm bg-surface-container rounded-lg border border-outline-variant/20">
                  <div className="w-full h-32 bg-surface-dim rounded-md mb-xs relative overflow-hidden">
                    <Image src={item.src} alt={item.title} fill className="object-cover" unoptimized />
                  </div>
                  <span className="text-label-md text-on-surface block">{item.title}</span>
                  <span className="text-caption text-on-surface-variant">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Calendar + Activity */}
        <div className="flex flex-col gap-xl">
          {/* Mini Calendar */}
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-sm">
              <span className="text-label-md text-on-surface font-semibold">September 2024</span>
              <div className="flex gap-xs">
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">chevron_left</span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">chevron_right</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-xs text-center">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className="text-[10px] font-bold text-on-surface-variant">{d}</div>
              ))}
              {calendarDays.flat().map((day, i) => (
                <div key={i} className={`text-caption py-xs rounded-md cursor-pointer ${
                  day === null ? "opacity-0 pointer-events-none" :
                  day === 3 ? "bg-primary text-on-primary relative" :
                  "hover:bg-primary/10 text-on-surface"
                }`}>
                  {day}
                  {day === 3 && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 shadow-sm">
            <h3 className="text-label-md font-semibold text-on-surface mb-md">Recent Activity</h3>
            <div className="relative pl-xs flex flex-col gap-md">
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-outline-variant/30" />
              {activityItems.map((item) => (
                <div key={item.title} className="relative pl-md flex flex-col gap-[2px]">
                  <span className={`absolute left-[-1px] top-1 w-4 h-4 bg-surface-container-lowest border-2 ${item.color} rounded-full`} />
                  <span className="text-caption font-bold text-on-surface">{item.title}</span>
                  <span className="text-[13px] text-on-surface-variant">{item.desc}</span>
                  <span className="text-[11px] text-on-surface-variant opacity-60">{item.ago}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
