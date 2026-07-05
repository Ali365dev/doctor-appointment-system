"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      <span className="material-symbols-outlined">logout</span>
      <span className="text-label-md">Logout</span>
    </button>
  );
}
