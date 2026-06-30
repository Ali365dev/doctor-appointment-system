import Image from "next/image";

export const metadata = { title: "Patient Directory | MedClinical" };

const patients = [
  { name: "Eleanor Vance", pid: "#MC-9021", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAE7Q07snq3gnM-TVmADcNcY8QIgUZ5TmDOkVhq6ZyRh6xSsCySz65FAyvOzoZR22cYRYkfjH_SHSvYJPQd9O5IaqMfxKbKXAcANBlBC2Sn9DowGe0c-Z655fugwro5SfYdbQ6SjQAdiW8TYcAKtnP8hi4KeyMxE0OpFJAy6hrcT3cScBFFTEBQrPleFjYlsOmCpgjA5iMNLh8AFUkNLrgjEf_tt7u9rcDnc__lhukVZycyLABTcGjE704v2FgvOBHrb3u7WcSaKpI", status: "Active", statusCls: "bg-secondary-container/10 text-on-secondary-container", lastVisit: "Oct 24, 2023", total: "12 Total" },
  { name: "Jordan Smith", pid: "#MC-7712", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjKfIQ39MwzGy_qIyPQmTLf1ruLPyD4AfJpFQHeaDPJ_G1VIGv5LLWeSExPcvyDc4UFe4DVV-wSgSQb9ZSHlYSfP8kKN6RS5o2DKjpy3uZBYA4FANtClwHYaRev260X03vUqKtG0si3aIn-mJExf6pxG-GNw9Hgh16vE-iARs1yLzsLWV9huPyPJ692A460i_2_ILV4SVfhfoFJq0Tc8aZD7qFGesmkJNCHbWpK4KtAB-KVOdxNY00vekAe4KT39kRuxiRty-AoAE", status: "Follow-up", statusCls: "bg-surface-container-high text-on-surface-variant", lastVisit: "Nov 02, 2023", total: "4 Total" },
  { name: "Dr. Sarah Chen", pid: "#MC-1104", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnqh6Y1b7ggObIwQ3qYMZStMRrPCgT3TyekxzH5gLWZs0p9FTCF6LdFHyrkcufxd2tXdnqIJFwsFN8tsPNo3Lk6XlcZ6eGRXZmqXGaflkGDYkJ_eIgfJX89WPbx_lyTUSbTefvYs3IhNXrHvgUc47LOd3Mhb38Y3bWaTEH3PEkaLp56FDiw7s8qHIbllFUnLtiaukcZyBAn0jDA7UAFnLBdhwnHUVkc-3R4CCTbMFwihynR-4L1ca5zeShTBR_ogo-KdocVHeuo8Y", status: "Critical", statusCls: "bg-error-container/10 text-on-error-container", lastVisit: "Oct 28, 2023", total: "28 Total" },
  { name: "Marcus Rodriguez", pid: "#MC-4409", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuANoktfVAV1Cf447RP5xYUVlJErWmTndhf2RYNYiqEgH2eSvcPL3Pe_1V-GE_q9FmOyX7XT9FK6ff9gXzUDB7D8Rwln6jP7OoZf70UPuNscRfqc-mEP9vWTCOyB-qwbyW0b4epoYHH62vchpao9A6E9aRQqX2WTU2akoYfoIleIBaRcWA1sYt-Tdt1EMsOj7Dptttndwr3R93zqcSfdfLjbU9FDmB6_9FvmuzquJN5EGC_8ZFOAVh3VObzRRCxv-uJWzmELcBs7Js0", status: "Active", statusCls: "bg-secondary-container/10 text-on-secondary-container", lastVisit: "Nov 05, 2023", total: "8 Total" },
  { name: "Aria Montgomery", pid: "#MC-1288", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6hpTZk1EdiT-jl9s2Rrbq2guEXy9-YSe0epZ8fLx9CUcQDFVx1B9YF4wuOVi5fdKbmEP3QuDsuNPoPBar-tFNvxuHOg2NtjNMGuWi2hSQfPQU-Vr1nU4ojwESZCSGRGNXsuhQzk_pqm5YYo0WQjcxZp5x8rMaqZl3MyukIci1RgSw9J88vn3gxucdZrO0tkktyk_c5CazAOIjLNdkjgp0rHe56fUG-reqnCpP-AfbCyLQ7LbSZ65_wZHu_4iVekgwxa0sSLrpMZs", status: "New", statusCls: "bg-surface-container-high text-on-surface-variant", lastVisit: "—", total: "1 Total" },
];

const stats = [
  { icon: "group", bg: "bg-primary-container/10 text-primary", label: "Total Patients", value: "1,284" },
  { icon: "event_available", bg: "bg-secondary-container/10 text-secondary", label: "New This Month", value: "42" },
  { icon: "clinical_notes", bg: "bg-tertiary-container/10 text-tertiary", label: "Recent Activity", value: "156" },
  { icon: "monitoring", bg: "bg-error-container/10 text-error", label: "Critical Alerts", value: "3" },
];

export default function PatientsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-gutter py-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Patient Directory</h2>
          <p className="text-body-md text-on-surface-variant mt-xs">Manage and monitor your clinical registry</p>
        </div>
        <div className="flex gap-sm">
          {[["filter_list","Filters"],["calendar_month","Date Range"],["download","Export"]].map(([icon, label]) => (
            <button key={label} className="flex items-center gap-xs px-md py-xs border border-outline-variant rounded-xl text-label-md hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">{icon}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant shadow-sm flex items-center gap-md">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
              <p className="text-headline-md font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant">
              {["Patient","Patient ID","Status","Last Visit","Appointments","Actions"].map((h,i) => (
                <th key={h} className={`px-md py-md font-semibold text-label-md text-on-surface-variant uppercase tracking-wider ${i===5?"text-right":""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {patients.map((p) => (
              <tr key={p.pid} className="hover:bg-surface-container-low transition-colors group">
                <td className="px-md py-md">
                  <div className="flex items-center gap-sm">
                    <Image src={p.src} alt={p.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" unoptimized />
                    <span className="font-semibold text-body-md">{p.name}</span>
                  </div>
                </td>
                <td className="px-md py-md text-body-md text-on-surface-variant">{p.pid}</td>
                <td className="px-md py-md">
                  <span className={`px-sm py-xs ${p.statusCls} text-xs font-bold rounded-full`}>{p.status}</span>
                </td>
                <td className="px-md py-md text-body-md">{p.lastVisit}</td>
                <td className="px-md py-md text-body-md">{p.total}</td>
                <td className="px-md py-md text-right">
                  <button className="text-primary font-semibold hover:underline text-body-md">
                    {p.status === "New" ? "Schedule Intake" : "View Profile"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-md bg-surface-container-low/30 border-t border-outline-variant flex justify-center">
          <button className="flex items-center gap-xs text-primary font-semibold hover:bg-primary/5 px-md py-xs rounded-xl transition-colors">
            <span className="material-symbols-outlined">person_add</span> Add New Patient
          </button>
        </div>
      </div>
    </div>
  );
}
