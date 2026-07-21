import Image from "next/image";

export const metadata = { title: "Clinical Dashboard | MedClinical" };

const scheduleRows = [
  {
    time: "09:00 AM",
    name: "Eleanor Shellstrop",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcDsD-RW-8SkA_SSsn3hnSIn5zgkNs8z_Zs56__4TGyXRFSuuWh0DTeWLIrUrNIolAyo0Trw2TVrP3w8FqzlmBWqBmyykLcfWAYKbeP8Ehbsv41gDEEV-j9EJIvwrjSTOrcqZpOKAUpRpZXvIlK04TJRaFj8HsNvGk_H-fhIPeE5mxyNTLMMvB0GkJaGNbC8baTz8K0RfQuf2J0RPOV80OllkUeZR1CFLjPW1JVMujXHwhoEZyUy8A2H49lJ_ef3pTndGYAfP59hk",
    type: "Consultation",
    statusLabel: "Confirmed",
    statusClass: "bg-green-100 text-green-700",
  },
  {
    time: "10:30 AM",
    name: "Chidi Anagonye",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYfkgMvCCB-BXjRbETtLzcKEEtOtiPF71Wj7MyPq87qvf1nRrVPXpw9v9rGJyinFYLWEVsi_Kp_e0IDC3KvZ1BymG3cvODZRZ9Ud9b3nXMviuppCgPtbIqh7dNWdsciZ0yd3d8uWCnaWJHK-vzne5yAX9g_qKCNMTgWQeGfWw6aPDuwDS-GEKQIjoU8W8I-tDX-f5nDUByCIb2jE8uk-qyQKBgmWIzTbnt6aeDeW6lcn5scfmz9daham6H1RgkyAfW_CU6_Q7-Tus",
    type: "Follow-up",
    statusLabel: "In Progress",
    statusClass: "bg-blue-100 text-blue-700",
  },
  {
    time: "11:15 AM",
    name: "Tahani Al-Jamil",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0wIQEWFotqQ-VX7Rh-FNpuu0WaqxZq9daY_snlVURU6eqtLnaDOArzb2jP5l8O8bbGGQ164tD7ga47wFF4Ui6MpwC9GFsBuIi3Ld_Yndvd1MGjVCqAKEzHrAN1186zGgnD3RSlaWnGP7xiNhUXfiiR67fgDV0MuCw4ujg77da_h_DJu0DfZzBhIXJNsXdf5lY_9sH87Sla2VBTlYO3ZUnfYZUXXkbLtHTgCeX2m468dsDMPd69EsKPidCIT2EAZ6et4sC_ID2ko0",
    type: "Diagnostics",
    statusLabel: "Arrived",
    statusClass: "bg-yellow-100 text-yellow-700",
  },
];

const activityItems = [
  { icon: "person_add", bg: "bg-blue-50 text-primary", title: "Patient Arrival", desc: "Jason Mendoza checked in for his 12:00 PM MRI.", ago: "2 mins ago" },
  { icon: "upload_file", bg: "bg-green-50 text-green-600", title: "Payment Upload", desc: "$450.00 co-pay processed for Michael Realman.", ago: "15 mins ago" },
  { icon: "clinical_notes", bg: "bg-yellow-50 text-yellow-600", title: "New Lab Record", desc: "Blood panel results available for Janet Fromfinance.", ago: "1 hour ago" },
];

export default function ClinicalDashboardPage() {
  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto space-y-xl">
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-headline-md font-semibold text-on-surface">Clinical Dashboard</h1>
        <p className="text-caption text-on-surface-variant">Wednesday, October 25, 2023</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-xs bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">event_note</span>
            </div>
            <span className="text-label-md text-green-600">+12%</span>
          </div>
          <p className="text-label-md text-on-surface-variant">Today&apos;s Appointments</p>
          <div className="flex items-baseline gap-xs mt-xs">
            <h3 className="text-headline-lg font-bold">14</h3>
            <span className="text-caption text-on-surface-variant">/ 8 Completed</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-md overflow-hidden">
            <div className="bg-primary h-full rounded-full w-[57%]" />
          </div>
        </div>
        <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-xs bg-tertiary/10 rounded-lg text-tertiary">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="text-caption text-error">Critical</span>
          </div>
          <p className="text-label-md text-on-surface-variant">Pending Payments</p>
          <div className="flex items-baseline gap-xs mt-xs">
            <h3 className="text-headline-lg font-bold">6</h3>
            <span className="text-caption text-on-surface-variant">Awaiting action</span>
          </div>
          <p className="mt-md text-caption text-on-surface-variant">Action required for 2 invoices</p>
        </div>
        <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="p-xs bg-secondary/10 rounded-lg text-secondary">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <p className="text-label-md text-on-surface-variant">Total Patients</p>
          <div className="flex items-baseline gap-xs mt-xs">
            <h3 className="text-headline-lg font-bold">1,240</h3>
          </div>
          <div className="flex gap-xs mt-md">
            {["bg-primary/20","bg-primary/40","bg-primary/60","bg-primary"].map((c,i) => (
              <div key={i} className={`h-2 flex-1 ${c} rounded-full`} />
            ))}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-xs">
            <div className="p-xs bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <p className="text-label-md text-on-surface-variant">Monthly Revenue</p>
          <h3 className="text-headline-lg font-bold">$12,450</h3>
          <div className="mt-xs h-10 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path d="M0 35 Q 25 30 40 20 T 60 25 T 100 5" fill="none" stroke="#2563EB" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Schedule + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Today's Schedule Table */}
        <div className="lg:col-span-2 space-y-md">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-semibold text-on-surface">Today&apos;s Schedule</h2>
            <button className="text-primary text-label-md hover:underline flex items-center gap-xs">
              Full Calendar <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-150">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-1">
                <tr className="bg-surface-container-low text-left">
                  {["Time","Patient","Type","Status","Action"].map((h,i) => (
                    <th key={h} className={`px-md py-sm text-label-md text-on-surface-variant ${i===4?"text-right":""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {scheduleRows.map((row) => (
                  <tr key={row.name} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-md py-sm text-label-md">{row.time}</td>
                    <td className="px-md py-sm">
                      <div className="flex items-center gap-sm">
                        <div className="h-8 w-8 rounded-full bg-surface-container overflow-hidden shrink-0">
                          <Image src={row.src} alt={row.name} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                        </div>
                        <span className="text-body-md font-medium">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-md py-sm text-body-md text-on-surface-variant">{row.type}</td>
                    <td className="px-md py-sm">
                      <span className={`px-sm py-[2px] rounded-full text-xs font-bold ${row.statusClass}`}>{row.statusLabel}</span>
                    </td>
                    <td className="px-md py-sm text-right">
                      <div className="relative group/tip inline-block">
                        <button className="p-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                        <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                          More options
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-md">
          <h2 className="text-headline-md font-semibold text-on-surface">Recent Activity</h2>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md space-y-lg">
            {activityItems.map((item) => (
              <div key={item.title} className="flex gap-md">
                <div className={`mt-xs h-8 w-8 shrink-0 flex items-center justify-center rounded-full ${item.bg}`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-body-md"><span className="font-bold">{item.title}</span>: {item.desc}</p>
                  <span className="text-caption text-on-surface-variant">{item.ago}</span>
                </div>
              </div>
            ))}
            <button className="w-full py-sm border-t border-outline-variant text-label-md text-on-surface-variant hover:text-primary transition-colors">
              View All History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
