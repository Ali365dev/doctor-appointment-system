"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";

interface AdminShellProps {
  user: { name: string; avatar?: string };
  children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar user={user} mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <main className="flex-1 md:ml-64 min-w-0 flex flex-col">
        <TopBar user={user} onMenuClick={() => setMobileNavOpen(true)} />
        <div className="pt-[72px] flex-1">{children}</div>
      </main>
    </div>
  );
}
