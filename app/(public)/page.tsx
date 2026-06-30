import Image from "next/image";
import Link from "next/link";
import ReviewsCarousel from "@/components/common/ReviewsCarousel";

const DOCTOR_THUMB =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC_RgzEzP0t_5OInOfb2uhBJb6Lr-v-gMiV4NfLdXuUjNb4U7u7OfqUskYFnuxvhEMsuGA9ttdIoWGQ86yW3TkS064PZq7xaRjD2iRBoCIWcvPIakK7-_ooN2ZP37VsBEH5g4V8MiCZFOAWgwTQEdHD0cNvd8rMgfZEQ0kyHqjhdWAjpFaVaV5NVge6Loh8BVAvWEeZ6_Y1G0WhJ8k7B95oikUI4ZAEv3V8O3o9MxzgRpB43EESaHn2s_o0OozYnO7KtTuoa7JCgPg";

const DOCTOR_PORTRAIT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA6FHM2ZS2be6uJ5ZQ-VHCHXtMG3pBgjRyUcOs3-mK1JbqgACyJ54Yc6KSUYMrLUCrm5nOFY_p3HS_070Hbd7jmVWJoXQ5oDg0m-zUmC6yQb6J2yWNedEio3H4MyZUlM1cBioUb-BpyxgEW33H0qHfuv-qPJSXMMqeAGhbftCu_090d8BZkQ5IzdQAt33sJGWdd5tPkfbloC8FQ_6dMxvWcWL-uNPx-qg-UPeBaM_xJdmjFb6t4EKpmdYVSuFAQPV5S1iZqYB5GQmE";

const MAP_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBUG5tFigr0LGVpALf7YlOS5j728w1_P94CPfH7I93Dyhes9MX6siw4sLiJaHYJjpGOAbXmkp-qxg9tBWYeAWOXSxt365Ny2WsMPckgDekTAlG9FI-TFoxpZSRAqh89EQaiyyyRje7SXVAF-zxcDMqGU2V_G7_NOMbRpIpihT_oQCS_ywkU24-nLlkNOfAaruiWWLv4n2VqyYqDlTU2ktU7bvVqsEhZFES9pB9TIrPWizw1LIcOTPJUbJ-SAzrSed_2cV_EQbOJr78";

const CTA_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuATKh7hiy8TZrlatl7coiegFfTo9HoAC_1jitGOsiq5J1XrA4zgq0Df73ZwzgcXbLWSPgM0tWxJeO3K9C6bbchiiQAwLcvyrseEcx5z8zk2tuQT3lGRUttFCqj04J2nYFojMNsGTKNvtGq0MDY84W8UvOJVGBsv1cjWhAdyp6BF0qaZ8XdI5eQgSZ9g5fDUur3abZI9gvJ_J7AjgWQSjKVdt3kUL97F-Dh5DuWf5Pif9UT5HkHhIaDaSJLiIpcnmELrjWu7W6bhHIc";

const services = [
  {
    icon: "stack",
    name: "Gastroenterology",
    desc: "Expert diagnosis and treatment of abdominal pain, bloating, and digestive disorders.",
  },
  {
    icon: "emergency",
    name: "Liver Diseases",
    desc: "Specialized care for Hepatitis, Fatty Liver, and Cirrhosis management.",
  },
  {
    icon: "visibility",
    name: "Endoscopy",
    desc: "Painless upper GI endoscopy and colonoscopy for internal examinations.",
  },
  {
    icon: "healing",
    name: "Ulcer Management",
    desc: "Comprehensive treatment plans for gastric and duodenal ulcers.",
  },
  {
    icon: "vital_signs",
    name: "Acid Reflux (GERD)",
    desc: "Advanced therapies to control heartburn and acid reflux symptoms.",
  },
  {
    icon: "monitoring",
    name: "Pancreatic Health",
    desc: "Diagnosis and treatment of pancreatitis and pancreatic masses.",
  },
  {
    icon: "biotech",
    name: "IBS Treatment",
    desc: "Management of Irritable Bowel Syndrome through lifestyle and medicine.",
  },
  {
    icon: "medication",
    name: "Biliary Disorders",
    desc: "Specialized care for gallstones and bile duct obstructions.",
  },
];

export default function HomePage() {
  return (
    <main className="pt-24 overflow-x-hidden">
      {/* ── Hero ── */}
      <section
        id="hero"
        className="relative min-h-[90vh] flex items-center px-gutter py-xl max-w-[1280px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center w-full">
          {/* Left: Profile */}
          <div className="lg:col-span-7 space-y-md">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dbe1ff] text-[#00174b] text-caption font-bold">
              <span
                className="material-symbols-outlined text-caption"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              CERTIFIED GASTROENTEROLOGIST
            </div>

            <h1 className="text-display font-bold leading-[1.1] tracking-[-0.02em] text-on-surface">
              Dr. Specialist
            </h1>

            <p className="text-headline-md font-semibold text-secondary leading-tight">
              MBBS, FCPS | Gastroenterology &amp; Hepatology
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-md py-sm">
              <div className="flex items-center gap-xs">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">work_history</span>
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">15+ Years</p>
                  <p className="text-caption text-on-surface-variant">Experience</p>
                </div>
              </div>
              <div className="flex items-center gap-xs">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </div>
                <div>
                  <p className="text-label-md font-semibold text-primary">4.9 Rating</p>
                  <p className="text-caption text-on-surface-variant">Patient Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Thumb + bio */}
            <div className="flex items-center gap-4 pt-sm">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white shrink-0">
                <Image
                  src={DOCTOR_THUMB}
                  alt="Dr. Specialist"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-body-lg text-on-surface-variant max-w-md leading-relaxed">
                Dedicated to providing high-quality medical care for gastrointestinal and liver
                disorders with a patient-centric approach.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-sm pt-md">
              <Link
                href="#booking"
                className="bg-primary text-on-primary px-lg py-sm rounded-xl text-label-md font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined text-label-md">calendar_month</span>
                Book Appointment
              </Link>
              <Link
                href="https://wa.me/1234567890"
                className="bg-surface-container-highest text-on-surface px-lg py-sm rounded-xl text-label-md font-semibold flex items-center gap-2 hover:bg-surface-dim transition-colors"
              >
                <span className="material-symbols-outlined text-label-md">chat</span>
                WhatsApp
              </Link>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-5 relative" id="booking">
            <div className="absolute -z-10 -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-12 -left-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />

            <div className="glass-card p-md rounded-2xl shadow-xl border border-white/30">
              <div className="mb-md">
                <h3 className="text-headline-md font-semibold text-on-surface">Book Appointment</h3>
                <p className="text-caption text-on-surface-variant">
                  Secure your consultation in minutes
                </p>
              </div>

              <form className="space-y-sm">
                <div className="grid grid-cols-2 gap-sm">
                  <div className="col-span-2">
                    <label className="block text-caption font-bold mb-xs text-outline">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-sm py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-caption font-bold mb-xs text-outline">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-sm py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-caption font-bold mb-xs text-outline">Gender</label>
                    <select className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-sm py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption font-bold mb-xs text-outline">Age</label>
                    <input
                      type="number"
                      placeholder="25"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-sm py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-bold mb-xs text-outline">Visit Type</label>
                    <select className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-sm py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                      <option>New Consult</option>
                      <option>Follow-up</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption font-bold mb-xs text-outline">Date</label>
                    <input
                      type="date"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-sm py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-bold mb-xs text-outline">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-sm py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-caption font-bold mb-xs text-outline">
                      Additional Notes
                    </label>
                    <textarea
                      placeholder="Reason for visit..."
                      rows={2}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-sm py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-sm rounded-xl font-bold shadow-lg hover:bg-primary-container transition-all mt-md"
                >
                  Confirm Booking
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="bg-surface-container-low py-xl px-gutter overflow-hidden">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          {/* Portrait */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <Image
                src={DOCTOR_PORTRAIT}
                alt="Dr. Specialist Portrait"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full z-0" />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/10 rounded-full z-0" />
            <div className="absolute bottom-6 left-6 glass-card p-sm rounded-xl z-20 shadow-lg border border-white/30">
              <p className="text-headline-md font-semibold text-primary">12k+</p>
              <p className="text-caption text-on-surface-variant">Patients Treated</p>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-md">
            <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
              About Dr. Specialist
            </h2>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Dr. Specialist is a leading Consultant Gastroenterologist and Hepatologist with over 15
              years of clinical excellence. He completed his graduation and post-graduation from
              top-tier medical universities, followed by specialized fellowships in advanced endoscopy
              and liver transplant care.
            </p>
            <div className="space-y-sm">
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-1">school</span>
                <div>
                  <h4 className="text-label-md font-semibold text-on-surface">
                    Academic Qualifications
                  </h4>
                  <ul className="text-on-surface-variant text-body-md list-disc list-inside mt-xs">
                    <li>MBBS - Global Medical University</li>
                    <li>FCPS (Gastroenterology) - College of Physicians &amp; Surgeons</li>
                    <li>Fellowship in Advanced Endoscopy</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-primary mt-1">workspace_premium</span>
                <div>
                  <h4 className="text-label-md font-semibold text-on-surface">
                    Certifications &amp; Memberships
                  </h4>
                  <ul className="text-on-surface-variant text-body-md list-disc list-inside mt-xs">
                    <li>Member of World Gastroenterology Organisation (WGO)</li>
                    <li>American Society for Gastrointestinal Endoscopy (ASGE)</li>
                    <li>Board Certified Hepatologist</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-xl px-gutter max-w-[1280px] mx-auto">
        <div className="text-center mb-xl">
          <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
            Specialized Services
          </h2>
          <p className="text-on-surface-variant mt-xs max-w-xl mx-auto">
            Comprehensive care for all digestive health issues using state-of-the-art diagnostic and
            therapeutic techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {services.map((s) => (
            <div
              key={s.name}
              className="p-md rounded-2xl bg-surface hover:shadow-xl hover:-translate-y-1 transition-all border border-outline-variant/30 group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined text-3xl">{s.icon}</span>
              </div>
              <h3 className="text-label-md font-semibold text-on-surface mb-xs">{s.name}</h3>
              <p className="text-caption text-on-surface-variant">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Clinic Info & Map ── */}
      <section id="clinic-info" className="py-xl px-gutter bg-surface-container-high/50">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            {/* Info */}
            <div className="space-y-md">
              <h2 className="text-headline-lg font-bold leading-[1.2] tracking-[-0.02em] text-on-surface">
                Visit Our Clinic
              </h2>
              <div className="bg-surface rounded-2xl p-lg shadow-md space-y-md">
                <div className="flex gap-sm">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <div>
                    <h4 className="text-label-md font-semibold text-on-surface">Clinic Address</h4>
                    <p className="text-on-surface-variant">
                      Suite 405, Specialist Medical Plaza, 123 Healthcare Blvd, Medical District.
                    </p>
                  </div>
                </div>
                <div className="flex gap-sm">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <div>
                    <h4 className="text-label-md font-semibold text-on-surface">Clinic Timings</h4>
                    <div className="grid grid-cols-2 gap-x-md text-on-surface-variant text-caption mt-xs">
                      <span>Mon - Fri:</span>
                      <span>09:00 AM - 05:00 PM</span>
                      <span>Saturday:</span>
                      <span>10:00 AM - 02:00 PM</span>
                      <span>Sunday:</span>
                      <span className="text-error font-bold">Closed</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-sm">
                  <span className="material-symbols-outlined text-primary">local_parking</span>
                  <div>
                    <h4 className="text-label-md font-semibold text-on-surface">Parking &amp; Access</h4>
                    <p className="text-on-surface-variant">
                      Free basement parking for patients. Wheelchair accessible entrance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="relative h-100 rounded-3xl overflow-hidden shadow-xl border border-outline-variant/30">
              <div className="absolute inset-0 bg-surface-dim">
                <Image
                  src={MAP_IMAGE}
                  alt="Clinic location map"
                  fill
                  className="object-cover grayscale opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary text-on-primary px-sm py-xs rounded-full shadow-2xl animate-bounce">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <ReviewsCarousel />

      {/* ── CTA ── */}
      <section className="py-xl px-gutter max-w-[1280px] mx-auto mb-xl">
        <div className="bg-primary rounded-4xl p-lg text-on-primary flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src={CTA_BG} alt="" fill className="object-cover" />
          </div>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-headline-lg font-bold leading-[1.2] mb-sm">
              Ready to improve your digestive health?
            </h2>
            <p className="opacity-90">
              Schedule your consultation today and take the first step towards a healthier life.
              Dr. Specialist and his team are here to help you.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-sm w-full md:w-auto">
            <Link
              href="#hero"
              className="bg-on-primary text-primary px-lg py-sm rounded-xl font-bold text-center hover:bg-on-primary/90 transition-all"
            >
              Book Online
            </Link>
            <Link
              href="tel:+1234567890"
              className="border-2 border-on-primary/30 text-on-primary px-lg py-sm rounded-xl font-bold text-center hover:bg-on-primary/10 transition-all"
            >
              Call +123 456 7890
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
