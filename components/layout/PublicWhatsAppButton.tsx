"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { buildWhatsappLink } from "@/lib/data";
import { useDoctorProfile } from "@/lib/context/DoctorProfileContext";

const HIDDEN_PATH_PREFIXES = ["/book-appointment"];

export default function PublicWhatsAppButton() {
  const pathname = usePathname();
  const { contactWhatsapp } = useDoctorProfile();

  const shouldHide = HIDDEN_PATH_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  const whatsappLink = buildWhatsappLink(contactWhatsapp ?? "");

  if (shouldHide || !whatsappLink) return null;

  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)]"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.386.696 4.611 1.897 6.484L4 29l7.7-1.86A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm6.98 16.995c-.29.816-1.44 1.531-2.354 1.712-.62.126-1.428.226-4.152-.892-3.483-1.44-5.723-4.977-5.897-5.207-.166-.229-1.408-1.874-1.408-3.577 0-1.702.885-2.539 1.2-2.885.29-.318.63-.397.84-.397.209 0 .42.002.604.011.194.01.454-.074.71.542.29.696.986 2.399 1.072 2.573.086.174.144.377.029.606-.115.229-.174.372-.343.573-.172.2-.36.446-.514.6-.172.172-.351.358-.15.703.199.344.885 1.462 1.9 2.368 1.306 1.163 2.407 1.523 2.753 1.694.346.172.548.144.75-.086.201-.229.858-1 1.088-1.343.229-.344.458-.286.774-.172.315.115 2.006.946 2.35 1.118.345.172.573.258.66.4.086.144.086.83-.204 1.646Z" />
      </svg>
    </motion.a>
  );
}
