"use client";

import { ReportStatus, STATUS_CONFIG } from "./data";

export type FilterKey = "all" | ReportStatus;
export type SortKey = "newest" | "oldest" | "title";
export type ViewMode = "grid" | "list";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: STATUS_CONFIG.pending.label },
  { key: "reviewing", label: STATUS_CONFIG.reviewing.label },
  { key: "replied", label: STATUS_CONFIG.replied.label },
  { key: "closed", label: STATUS_CONFIG.closed.label },
];

interface ReportsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ReportsFilters({
  search, onSearchChange, activeFilter, onFilterChange, sort, onSortChange, view, onViewChange,
}: ReportsFiltersProps) {
  return (
    <div className="space-y-sm">
      <div className="flex flex-wrap items-center gap-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 leading-none text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports by title or category…"
            className="pl-10 pr-sm py-xs w-full bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="px-sm py-xs bg-surface-container-low border border-outline-variant/50 rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary transition-all"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title (A–Z)</option>
        </select>

        <div className="flex bg-surface-container-low border border-outline-variant/50 rounded-lg p-[2px]">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            aria-label="Grid view"
            className={`p-xs rounded-md transition-colors ${view === "grid" ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant"}`}
          >
            <span className="material-symbols-outlined text-body-lg">grid_view</span>
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-label="List view"
            className={`p-xs rounded-md transition-colors ${view === "list" ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant"}`}
          >
            <span className="material-symbols-outlined text-body-lg">view_list</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-xs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`px-md py-xs rounded-full text-label-md font-semibold transition-all ${
              activeFilter === f.key
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
