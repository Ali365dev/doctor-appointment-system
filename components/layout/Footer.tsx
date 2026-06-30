import Link from "next/link";

const socialLinks = [
  { icon: "face_nod", label: "Facebook" },
  { icon: "photo_camera", label: "Instagram" },
  { icon: "play_circle", label: "YouTube" },
  { icon: "close", label: "X" },
];

const quickLinks = [
  { href: "#about", label: "About Dr. Specialist" },
  { href: "#services", label: "Our Services" },
  { href: "#clinic-info", label: "Clinic Locations" },
  { href: "#booking", label: "Book Now" },
];

const contactItems = [
  { icon: "call", text: "+92 (51) 123-4567" },
  { icon: "mail", text: "info@drspecialist.com" },
  { icon: "location_on", text: "123 Healthcare Blvd, Medical District" },
];

const legalLinks = ["Privacy Policy", "Terms of Service", "Disclaimer"];

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container border-t border-outline-variant/30">
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg px-lg py-xl max-w-[1280px] mx-auto w-full">
        {/* Brand */}
        <div className="md:col-span-5 flex flex-col space-y-md">
          <h2 className="text-primary text-headline-md font-bold tracking-tight">Dr. Specialist</h2>
          <p className="text-body-md text-on-surface-variant max-w-md leading-relaxed">
            Consultant Gastroenterologist &amp; Hepatologist providing world-class medical care for liver
            and digestive disorders. Committed to clinical excellence and patient well-being.
          </p>
          <div className="flex gap-sm pt-sm">
            {socialLinks.map(({ icon, label }) => (
              <Link
                key={label}
                href="#"
                aria-label={label}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm border border-outline-variant/20 text-secondary hover:bg-secondary hover:text-on-primary transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 flex flex-col space-y-md">
          <div className="flex items-center gap-xs">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h3 className="text-label-md font-semibold text-on-surface uppercase tracking-widest">
              Quick Links
            </h3>
          </div>
          <nav className="flex flex-col space-y-sm">
            {quickLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-body-md text-on-surface-variant hover:text-primary hover:pl-1 transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact */}
        <div className="md:col-span-4 flex flex-col space-y-md">
          <div className="flex items-center gap-xs">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h3 className="text-label-md font-semibold text-on-surface uppercase tracking-widest">
              Contact
            </h3>
          </div>
          <div className="flex flex-col space-y-md">
            {contactItems.map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-sm group">
                <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-body-lg">{icon}</span>
                </div>
                <span className="text-body-md text-on-surface-variant">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-[1280px] mx-auto px-lg">
        <div className="h-px w-full bg-outline-variant/30" />
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1280px] mx-auto px-lg py-md flex flex-col md:flex-row justify-between items-center gap-sm">
        <div className="text-caption text-outline">
          © 2024 Dr. Specialist. All rights reserved.{" "}
          <span className="ml-2 px-2 py-0.5 bg-surface-container-high rounded-full border border-outline-variant/20">
            PMDC Registration: 12345-P
          </span>
        </div>
        <div className="flex gap-md">
          {legalLinks.map((item) => (
            <Link
              key={item}
              href="#"
              className="text-caption text-on-surface-variant hover:text-primary transition-colors hover:underline"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
