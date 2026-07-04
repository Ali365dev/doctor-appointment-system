import Image from "next/image";
import { doctor } from "@/lib/data";

export const metadata = { title: "Website CMS | MedClinical" };

const services = [
  { icon: "biotech", name: "Advanced Diagnostics", desc: "Using state-of-the-art imaging technology.", price: "$250.00" },
  { icon: "vaccines", name: "Immunization Programs", desc: "Full suite of clinical vaccinations.", price: "$85.00" },
  { icon: "monitor_heart", name: "Chronic Care Management", desc: "Long-term planning for complex conditions.", price: "$150.00" },
];

const testimonials = [
  { quote: `The level of care and technical expertise provided by ${doctor.name} is unmatched. The clinic environment is serene and modern, making every visit a positive experience.`, author: "Sarah J. Jenkins", sub: "Patient since 2021" },
  { quote: `${doctor.name} explained my procedure in detail and made me feel completely at ease. I've never had a clinical experience feel so personalized.`, author: "Robert M.", sub: "Verified Review" },
];

export default function WebsiteCMSPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mt-0 p-xl flex-1 overflow-y-auto bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-xl">
            <div>
              <h2 className="text-headline-lg font-bold text-on-surface mb-xs">Website Management</h2>
              <p className="text-on-surface-variant text-body-md">Modify your digital presence in real-time with our zero-code CMS.</p>
            </div>
            <div className="flex gap-sm">
              <button className="px-md py-xs rounded-xl border border-outline text-primary font-semibold hover:bg-surface-container transition-colors">Discard Changes</button>
              <button className="px-md py-xs rounded-xl bg-primary text-on-primary font-semibold shadow-lg hover:shadow-primary/20 transition-all">Publish Changes</button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-md pb-xl">
            {/* Doctor Profile */}
            <section className="col-span-12 lg:col-span-8 bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">account_circle</span>
                  <h3 className="text-headline-md font-semibold">Doctor Profile</h3>
                </div>
                <span className="text-caption text-on-surface-variant italic">Last updated 2 hours ago</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="col-span-1 flex flex-col items-center gap-md">
                  <div className="relative group w-full aspect-square max-w-[200px] rounded-xl overflow-hidden border border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low cursor-pointer">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUzNRzyVZRCNAGBaKq60SIMDBMOCd3Tj330GdxmGKzEfLUCXkPektOASZeOlBqqauSXgoJ_Z8SfQdWMVf1KwNqVvFgRlQk5g8_eIpELH40V7bRcOe9V6y7OSJeo1mmB-gkqbERGWMk-68fBpYHfGe5cbu2LcQwyIAjpzYjUbdq6cIEuZyjH1jFP7A7UDunL3XYhJGl9aUS5mWKIa77deGIwCmFq_7MLK6vgoZTEaEynPBFi4c2HnXRgRpEFYL99HHXWUA29VtthyY"
                      alt="Doctor" fill className="object-cover" unoptimized
                    />
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-on-primary">
                      <span className="material-symbols-outlined text-[32px]">upload</span>
                      <span className="text-xs font-bold uppercase mt-xs">Replace Photo</span>
                    </div>
                  </div>
                  <p className="text-caption text-center text-on-surface-variant">Recommended: 800x800px JPG/PNG</p>
                </div>
                <div className="col-span-2 space-y-md">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Display Name</label>
                    <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" defaultValue={doctor.name} />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Short Bio</label>
                    <textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" rows={4} defaultValue="Board-certified specialist with over 15 years of experience in advanced clinical procedures. Dedicated to delivering personalized patient care with a focus on innovative therapeutic techniques." />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-xs">Qualifications</label>
                    <div className="flex flex-wrap gap-xs p-xs border border-outline-variant rounded-lg bg-surface-container-lowest">
                      {["MBBS","PhD Oncology","FACS"].map((q) => (
                        <span key={q} className="px-sm py-xs bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-xs">
                          {q} <span className="material-symbols-outlined text-[14px] cursor-pointer">close</span>
                        </span>
                      ))}
                      <input className="bg-transparent border-none focus:ring-0 p-0 text-xs flex-1 min-w-[80px]" placeholder="Add new..." type="text" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SEO Settings */}
            <section className="col-span-12 lg:col-span-4 bg-surface border border-outline-variant rounded-2xl p-md shadow-sm flex flex-col">
              <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-secondary">trending_up</span>
                <h3 className="text-headline-md font-semibold">SEO Settings</h3>
              </div>
              <div className="space-y-md flex-1">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Page Title</label>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" defaultValue={`${doctor.name} | Advanced Clinical Care`} />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Meta Description</label>
                  <textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all resize-none text-sm" rows={3} defaultValue={`Experience world-class specialist medical care with ${doctor.name}. Book your consultation today.`} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">Search Indexing</p>
                    <p className="text-caption text-on-surface-variant">Allow Google to find your clinic.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>
              <div className="mt-md pt-md border-t border-outline-variant">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">SEO Health Score</span>
                  <span className="text-sm font-bold text-green-600">Excellent (92%)</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-xs overflow-hidden">
                  <div className="bg-green-600 h-full rounded-full w-[92%]" />
                </div>
              </div>
            </section>

            {/* Services */}
            <section className="col-span-12 lg:col-span-7 bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-tertiary">medical_services</span>
                  <h3 className="text-headline-md font-semibold">Clinic Services</h3>
                </div>
                <button className="flex items-center gap-xs text-primary font-bold hover:underline">
                  <span className="material-symbols-outlined text-[20px]">add_box</span> Add Service
                </button>
              </div>
              <div className="space-y-sm">
                {services.map((s) => (
                  <div key={s.name} className="flex items-center gap-md p-md bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined">{s.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-on-surface">{s.name}</h4>
                      <p className="text-xs text-on-surface-variant">{s.desc}</p>
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="px-sm py-xs bg-surface-container-highest text-on-surface-variant text-xs rounded-full">{s.price}</span>
                      <button className="p-xs hover:bg-surface-container rounded-full text-on-surface-variant transition-colors opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                      <button className="p-xs hover:bg-error/10 rounded-full text-error transition-colors opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Clinic Info */}
            <section className="col-span-12 lg:col-span-5 bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                <h3 className="text-headline-md font-semibold">Clinic Information</h3>
              </div>
              <div className="space-y-md">
                <div className="flex gap-md">
                  <div className="flex-1">
                    <label className="block text-label-md text-on-surface-variant mb-xs">Street Address</label>
                    <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="124 Medical Plaza Dr." />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-label-md text-on-surface-variant mb-xs">Suite</label>
                    <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="304" />
                  </div>
                </div>
                <div className="h-32 rounded-xl overflow-hidden relative border border-outline-variant">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6glmjYFfgEEf3hXuHMBm-QNlx52m5x8GgHKeLj7iQ99XxBBNtgi9RltF0SjtWBZTyrPJnTkSmajTN3s1t3-JW1WkNT17TPn2CL98nSTIPT92L7ZlSAljZsqFAisJF36styF_f33Oo5g8H4mIphkSHEprC4DJYAe2Fm6wCIopfBmZzGPDmeGQzCgfp3UxWzfwi8__CBVfN5w8c99_UjiLbCpONsxRjc7xeRidKRW5bNAVZ5--caX23u8fdBYb4wdceUE34rdyT-MY"
                    alt="Clinic Map" fill className="object-cover" unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-xs left-xs flex items-center gap-xs bg-surface/90 px-xs py-[2px] rounded text-[10px] font-bold text-on-surface border border-outline-variant">
                    <span className="material-symbols-outlined text-[12px]">pin_drop</span> LIVE MAP VIEW
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-md">
                  {[["Mon - Fri Hours","08:00 AM - 06:00 PM"],["Sat Hours","10:00 AM - 02:00 PM"]].map(([label, val]) => (
                    <div key={label}>
                      <label className="block text-label-md text-on-surface-variant mb-xs">{label}</label>
                      <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={val} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="col-span-12 bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <div className="flex items-center justify-between mb-xl">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <h3 className="text-headline-md font-semibold">Patient Testimonials</h3>
                </div>
                <div className="flex gap-xs">
                  <button className="px-md py-xs bg-surface-container text-on-surface font-semibold rounded-lg hover:bg-surface-container-high transition-colors">Import from Google</button>
                  <button className="px-md py-xs bg-primary text-on-primary font-semibold rounded-lg shadow-sm hover:brightness-110 transition-all">Write Manual Entry</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                {testimonials.map((t) => (
                  <div key={t.author} className="bg-surface-container-lowest border border-outline-variant p-md rounded-2xl relative group">
                    <div className="flex items-center gap-xs mb-md">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-amber-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-sm italic text-on-surface mb-md leading-relaxed">&quot;{t.quote}&quot;</p>
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest" />
                      <div>
                        <h5 className="text-xs font-bold text-on-surface">{t.author}</h5>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t.sub}</p>
                      </div>
                    </div>
                    <div className="absolute top-md right-md flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-xs hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[16px]">visibility_off</span></button>
                      <button className="p-xs hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                    </div>
                  </div>
                ))}
                <div className="border-2 border-dashed border-outline-variant p-md rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center mb-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">add_comment</span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface-variant group-hover:text-primary">Click to add another patient review</p>
                  <p className="text-[11px] text-on-surface-variant mt-xs">Enhance social proof and clinic trust.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
