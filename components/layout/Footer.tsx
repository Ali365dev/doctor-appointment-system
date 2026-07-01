import Link from "next/link";
import { doctor } from "@/lib/data";

const quickLinks = [
  { href: "#about", label: "About Dr. Zaid Gul" },
  { href: "#services", label: "Our Services" },
  { href: "#conditions", label: "Conditions Treated" },
  { href: "#treatments", label: "Treatments & Pricing" },
  { href: "#clinic-info", label: "Practice Locations" },
  { href: "#hero", label: "Book Appointment" },
];

const legalLinks = ["Privacy Policy", "Terms of Service", "Disclaimer"];

export default function Footer() {
  const { name, contact, practice_locations, verification } = doctor;
  const firstLocation = practice_locations[0];

  const contactItems = [
    ...(contact.helpline
      ? [{ icon: "call", text: contact.helpline, href: `tel:${contact.helpline}` }]
      : []),
    ...(contact.whatsapp
      ? [{ icon: "chat", text: "WhatsApp", href: contact.whatsapp }]
      : []),
    ...(firstLocation?.address
      ? [{ icon: "location_on", text: firstLocation.address, href: firstLocation.map_link }]
      : []),
  ];

  return (
    <footer className="w-full bg-surface-container border-t border-outline-variant/30">
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg px-lg py-xl max-w-[1280px] mx-auto w-full">
        {/* Brand */}
        <div className="md:col-span-5 flex flex-col space-y-md">
          <h2 className="text-primary text-headline-md font-bold tracking-tight">{name}</h2>
          <p className="text-body-md text-on-surface-variant max-w-md leading-relaxed">
            Consultant Gastroenterologist &amp; Hepatologist providing world-class medical care for liver
            and digestive disorders. Committed to clinical excellence and patient well-being.
          </p>
          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-sm pt-sm">
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-lg text-label-md font-semibold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              WhatsApp
            </a>
            <a
              href={`tel:${contact.helpline}`}
              className="flex items-center gap-xs px-md py-xs border border-primary text-primary rounded-lg text-label-md font-semibold hover:bg-primary/5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              {contact.helpline}
            </a>
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
              Contact &amp; Locations
            </h3>
          </div>
          <div className="flex flex-col space-y-md">
            {contactItems.map(({ icon, text, href }) =>
              href ? (
                <a
                  key={text}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-sm group"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-body-lg">{icon}</span>
                  </div>
                  <span className="text-body-md text-on-surface-variant group-hover:text-primary transition-colors">
                    {text}
                  </span>
                </a>
              ) : (
                <div key={text} className="flex items-start gap-sm">
                  <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined text-body-lg">{icon}</span>
                  </div>
                  <span className="text-body-md text-on-surface-variant">{text}</span>
                </div>
              )
            )}
          </div>

          {/* All locations summary */}
          {practice_locations.length > 1 && (
            <div className="mt-sm">
              <p className="text-caption text-on-surface-variant font-semibold mb-xs uppercase tracking-wider">
                All Locations
              </p>
              {practice_locations.map((loc, i) => (
                <p key={i} className="text-caption text-on-surface-variant py-xs border-b border-outline-variant/20 last:border-0">
                  {loc.name}
                  <span className="ml-sm text-primary font-semibold">Rs. {loc.fee_pkr.toLocaleString()}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-[1280px] mx-auto px-lg">
        <div className="h-px w-full bg-outline-variant/30" />
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1280px] mx-auto px-lg py-md flex flex-col md:flex-row justify-between items-center gap-sm">
        <div className="text-caption text-outline">
          © 2024 {name}. All rights reserved.{" "}
          <span className="ml-2 px-2 py-0.5 bg-surface-container-high rounded-full border border-outline-variant/20">
            {verification}
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
