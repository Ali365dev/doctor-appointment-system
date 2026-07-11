"use client";

import Image from "next/image";
import { useState } from "react";

interface TopBarProps {
  user: { name: string; avatar?: string };
  onMenuClick?: () => void;
}

export default function TopBar({ user, onMenuClick }: TopBarProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 px-gutter py-sm flex items-center justify-between gap-md">
      <div className="flex items-center gap-sm flex-1 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-xs rounded-lg hover:bg-surface-container-high transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">menu</span>
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appointments or patients..."
            className="w-full pl-10 pr-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-md">
        {/* Notifications */}
        <button className="relative p-xs rounded-lg hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* Settings */}
        <button className="p-xs rounded-lg hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">settings</span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-outline-variant/50" />

        {/* Identity */}
        <div className="flex items-center gap-xs">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-highest shrink-0 flex items-center justify-center">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} width={32} height={32} className="w-full h-full object-cover" unoptimized />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
            )}
          </div>
          <span className="hidden sm:block text-label-md font-semibold text-on-surface">{user.name}</span>
        </div>
      </div>
    </header>
  );
}
