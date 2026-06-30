import Link from "next/link";

export const metadata = { title: "Appointments | MedClinical" };

const appointments = [
  { initials: "JD", color: "bg-primary/10 text-primary", name: "Jonathan Doe", pid: "#22940", date: "Oct 14, 2023", time: "09:30 AM", type: "Consultation", typeCls: "bg-secondary-container/10 text-on-secondary-container border-secondary-container/20", dot: "bg-emerald-500", status: "Confirmed" },
  { initials: "AM", color: "bg-secondary-container/10 text-secondary", name: "Alice Miller", pid: "#22938", date: "Oct 14, 2023", time: "11:00 AM", type: "Follow-up", typeCls: "bg-tertiary-fixed/30 text-on-tertiary-fixed-variant border-tertiary-fixed/20", dot: "bg-amber-400", status: "Pending" },
  { initials: "SK", color: "bg-surface-container-high text-on-surface", name: "Samuel King", pid: "#22935", date: "Oct 14, 2023", time: "02:15 PM", type: "Lab Result", typeCls: "bg-surface-variant text-on-surface-variant border-outline-variant/30", dot: "bg-outline", status: "Completed" },
  { initials: "HW", color: "bg-primary/10 text-primary", name: "Helen White", pid: "#22931", date: "Oct 15, 2023", time: "10:00 AM", type: "Consultation", typeCls: "bg-secondary-container/10 text-on-secondary-container border-secondary-container/20", dot: "bg-emerald-500", status: "Confirmed" },
];

export default function AppointmentsPage() {
  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      {/* Page header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Appointments Management</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Manage and track patient schedules with clinical precision.</p>
        </div>
        <div className="flex gap-sm">
          <button className="flex items-center gap-xs px-md py-xs rounded-xl border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">download</span> Export List
          </button>
          <Link href="/admin/appointments/verify" className="flex items-center gap-xs px-md py-xs rounded-xl bg-primary text-on-primary font-semibold hover:shadow-lg transition-all">
            <span className="material-symbols-outlined">qr_code_scanner</span> Verify
          </Link>
          <button className="flex items-center gap-xs px-md py-xs rounded-xl bg-primary text-on-primary font-semibold hover:shadow-lg transition-all">
            <span className="material-symbols-outlined">add</span> New Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-2xl p-md mb-xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center justify-between gap-md">
        <div className="flex items-center gap-md">
          <div className="flex bg-surface-container-low p-xs rounded-xl">
            <button className="px-md py-xs rounded-lg bg-surface-container-lowest shadow-sm text-label-md font-bold text-primary">All</button>
            <button className="px-md py-xs rounded-lg text-label-md text-on-surface-variant hover:text-on-surface">Confirmed</button>
            <button className="px-md py-xs rounded-lg text-label-md text-on-surface-variant hover:text-on-surface">Pending</button>
          </div>
          <div className="h-6 w-px bg-outline-variant" />
          <div className="flex items-center gap-xs text-on-surface-variant bg-surface-container-low px-md py-xs rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span className="text-label-md font-medium">Oct 12 – Oct 19, 2023</span>
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <button className="p-xs rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-high">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <div className="relative">
            <select className="appearance-none bg-surface-container-low border-none rounded-xl pl-md pr-10 py-xs text-label-md font-medium focus:ring-primary/20 cursor-pointer">
              <option>Visit Type: All</option>
              <option>Consultation</option>
              <option>Follow-up</option>
              <option>Lab Result</option>
            </select>
            <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                {["Patient Name","Date & Time","Visit Type","Status","Actions"].map((h, i) => (
                  <th key={h} className={`px-md py-md text-label-md text-on-surface-variant ${i===4?"text-right":""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {appointments.map((apt) => (
                <tr key={apt.pid} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-md py-md">
                    <div className="flex items-center gap-sm">
                      <div className={`w-10 h-10 rounded-full ${apt.color} flex items-center justify-center font-bold`}>{apt.initials}</div>
                      <div>
                        <p className="text-body-md font-semibold">{apt.name}</p>
                        <p className="text-caption text-on-surface-variant">PID: {apt.pid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-md py-md">
                    <p className="text-body-md font-medium">{apt.date}</p>
                    <p className="text-caption text-on-surface-variant">{apt.time}</p>
                  </td>
                  <td className="px-md py-md">
                    <span className={`px-sm py-[2px] rounded-full ${apt.typeCls} text-caption font-bold border`}>{apt.type}</span>
                  </td>
                  <td className="px-md py-md">
                    <div className="flex items-center gap-xs">
                      <div className={`w-2 h-2 rounded-full ${apt.dot}`} />
                      <span className="text-body-md font-medium">{apt.status}</span>
                    </div>
                  </td>
                  <td className="px-md py-md text-right">
                    <div className="flex items-center justify-end gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-xs text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg"><span className="material-symbols-outlined text-[20px]">visibility</span></button>
                      <button className="p-xs text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                      <button className="p-xs text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-lg"><span className="material-symbols-outlined text-[20px]">cancel</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-md py-sm bg-surface-container-low/50 flex items-center justify-between border-t border-outline-variant/30">
          <span className="text-caption text-on-surface-variant">Showing 1 to 4 of 48 entries</span>
          <div className="flex gap-xs">
            <button disabled className="p-xs rounded-lg border border-outline-variant disabled:opacity-30"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
            <button className="px-sm py-xs rounded-lg bg-primary text-on-primary text-caption font-bold">1</button>
            <button className="px-sm py-xs rounded-lg hover:bg-surface-container-high text-caption font-bold">2</button>
            <button className="px-sm py-xs rounded-lg hover:bg-surface-container-high text-caption font-bold">3</button>
            <button className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Stats Bottom Row */}
      <div className="mt-xl grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-primary text-on-primary p-md rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-label-md opacity-80 mb-xs uppercase tracking-wider">Weekly Forecast</p>
            <h4 className="text-headline-lg font-bold">124</h4>
            <p className="mt-md text-body-md font-medium flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">trending_up</span> 12% increase from last week
            </p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 group-hover:rotate-12 transition-transform duration-500">event_available</span>
        </div>
        <div className="bg-surface-container-lowest p-md rounded-2xl shadow-sm border border-outline-variant/30">
          <div className="flex justify-between items-start mb-md">
            <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Type Distribution</p>
            <span className="material-symbols-outlined text-primary">pie_chart</span>
          </div>
          <div className="space-y-sm">
            {[["Consultations","58%","bg-primary","w-[58%]"],["Follow-ups","32%","bg-secondary-container","w-[32%]"]].map(([label,pct,bg,w]) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-xs">
                  <span className="text-body-md text-on-surface-variant">{label}</span>
                  <span className="font-bold">{pct}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`${bg} h-full ${w}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-md rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-md">Waitlist Status</p>
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">group_add</span>
              </div>
              <div>
                <h5 className="text-headline-md font-bold">18</h5>
                <p className="text-caption text-on-surface-variant">Patients waiting for priority</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-md py-xs bg-surface-container-high text-on-surface font-bold text-label-md rounded-xl hover:bg-outline-variant/30 transition-colors">
            Manage Waitlist
          </button>
        </div>
      </div>
    </div>
  );
}
