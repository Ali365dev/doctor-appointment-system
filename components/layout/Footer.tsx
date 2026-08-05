import type { JSX } from "react";
import Link from "next/link";
import { buildWhatsappLink } from "@/lib/data";
import { getCmsProfile } from "@/services/mongodb/repositories/cms.repository";
import { findActiveClinics } from "@/services/mongodb/repositories/clinic.repository";

const SocialSvg: Record<string, (props: { className?: string }) => JSX.Element> = {
  facebook: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  ),
  instagram: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23 12s0-3.5-.45-5.17a2.87 2.87 0 0 0-2-2C18.88 4.4 12 4.4 12 4.4s-6.88 0-8.55.43a2.87 2.87 0 0 0-2 2C1 8.5 1 12 1 12s0 3.5.45 5.17a2.87 2.87 0 0 0 2 2C5.12 19.6 12 19.6 12 19.6s6.88 0 8.55-.43a2.87 2.87 0 0 0 2-2C23 15.5 23 12 23 12Z" />
      <path d="M9.8 15.3V8.7l5.7 3.3-5.7 3.3Z" fill="#fff" />
    </svg>
  ),
  linkedin: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  ),
};

export default async function Footer() {
  const {
    name,
    contactEmail,
    contactPhone,
    contactWhatsapp,
    social,
    verification,
    footerDescription,
    footerQuickLinksHeading,
    footerQuickLinks,
    footerContactHeading,
    footerLegalLinks,
    footerCopyrightText,
  } = await getCmsProfile();
  const clinics = await findActiveClinics();
  const firstLocation = clinics[0];
  const socialLinks = Object.entries(social ?? {}).filter(
    ([platform, url]) => !!url && platform in SocialSvg
  ) as [string, string][];
  const whatsappHref = buildWhatsappLink(contactWhatsapp);

  const contactItems = [
    ...(contactPhone
      ? [{ icon: "call", text: contactPhone, href: `tel:${contactPhone}` }]
      : []),
    ...(contactWhatsapp
      ? [{ icon: "chat", text: "WhatsApp", href: whatsappHref }]
      : []),
    ...(contactEmail
      ? [{ icon: "mail", text: contactEmail, href: `mailto:${contactEmail}` }]
      : []),
    ...(firstLocation?.address
      ? [{ icon: "location_on", text: firstLocation.address, href: firstLocation.mapLink }]
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
            {footerDescription}
          </p>
          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-sm pt-sm">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-lg text-label-md font-semibold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              WhatsApp
            </a>
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center gap-xs px-md py-xs border border-primary text-primary rounded-lg text-label-md font-semibold hover:bg-primary/5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              {contactPhone}
            </a>
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex gap-sm pt-sm">
              {socialLinks.map(([platform, url]) => {
                const Icon = SocialSvg[platform];
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="w-9 h-9 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary hover:bg-secondary hover:text-on-primary transition-colors"
                  >
                    {Icon ? <Icon className="w-[18px] h-[18px]" /> : null}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 flex flex-col space-y-md">
          <div className="flex items-center gap-xs">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h3 className="text-label-md font-semibold text-on-surface uppercase tracking-widest">
              {footerQuickLinksHeading}
            </h3>
          </div>
          <nav className="flex flex-col space-y-sm">
            {footerQuickLinks.map(({ href, label }) => (
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
              {footerContactHeading}
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
          {clinics.length > 1 && (
            <div className="mt-sm">
              <p className="text-caption text-on-surface-variant font-semibold mb-xs uppercase tracking-wider">
                All Locations
              </p>
              {clinics.map((clinic) => {
                const mapLink = clinic.mapLink ?? undefined;
                return (
                  <a
                    key={String(clinic._id)}
                    href={mapLink}
                    target={mapLink ? "_blank" : undefined}
                    rel={mapLink ? "noopener noreferrer" : undefined}
                    className={`flex items-center justify-between gap-sm text-caption text-on-surface-variant py-xs border-b border-outline-variant/20 last:border-0 ${
                      mapLink ? "hover:text-primary transition-colors cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {mapLink && (
                        <span className="material-symbols-outlined text-[14px] shrink-0">location_on</span>
                      )}
                      {clinic.name}
                    </span>
                    <span className="text-primary font-semibold shrink-0">Rs. {clinic.feePkr.toLocaleString()}</span>
                  </a>
                );
              })}
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
          © {new Date().getFullYear()} {name}. {footerCopyrightText}{" "}
          <span className="ml-2 px-2 py-0.5 bg-surface-container-high rounded-full border border-outline-variant/20">
            {verification}
          </span>
        </div>
        <div className="flex gap-md">
          {footerLegalLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-caption text-on-surface-variant hover:text-primary transition-colors hover:underline"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
