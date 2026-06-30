"use client";

import Image from "next/image";
import { useState } from "react";

export default function TopBar() {
  const [search, setSearch] = useState("");

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 px-gutter py-sm flex items-center justify-between gap-md">
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

        {/* Doctor profile */}
        <div className="flex items-center gap-xs cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-label-md font-semibold text-on-surface leading-none">Dr. Sarah Specialist</span>
            <span className="text-caption text-on-surface-variant">Clinical Director</span>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary/20 group-hover:border-primary/50 transition-colors shrink-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVFroceKentGX_zGpM9-kSeItLNGte67uw7a_iy8AVgJDxpncKJUShPW32MHwO_26oqWMbaNOmY8nH8hoWCZ5Fs334tjg1igym1in0KeISACyl951Fp6OZIwn92MQHIraVdZxDVy-MCoT2x3oNF0r7hc7AVu-u4A8cDDIqy2B2QZBA47CbRv9sRwGCLpVvJNyDUbf4Q7vJE7RDOpDOoZ7c6YN0Z_5w_m1CRS94Lhj2Mpd3nu-sQTE0yCzUsrIyXW13fiWdxe5MI-4"
              alt="Dr. Sarah Specialist"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>
    </header>
  );
}
