"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Report } from "./data";
import ReportsHeader from "./ReportsHeader";
import ReportsFilters, { FilterKey, SortKey, ViewMode } from "./ReportsFilters";
import ReportsGrid from "./ReportsGrid";

export default function MedicalRecordsContent() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/medical-records");
        const data = await res.json();
        if (res.ok) setReports(data.reports ?? []);
        else toast.error(data.error ?? "Could not load medical records");
      } catch {
        toast.error("Network error loading medical records");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = reports;
    if (filter !== "all") list = list.filter((r) => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    const sorted = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sort === "newest" ? diff : -diff;
    });
    return sorted;
  }, [reports, filter, search, sort]);

  const handleDelete = async (id: string) => {
    const previous = reports;
    setReports((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/medical-records/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setReports(previous);
        toast.error(data.error ?? "Could not delete report");
        return;
      }
      toast.success("Report deleted.");
    } catch {
      setReports(previous);
      toast.error("Network error deleting report");
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-gutter py-xl space-y-lg">
      <ReportsHeader />
      <ReportsFilters
        search={search}
        onSearchChange={setSearch}
        activeFilter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />
      <ReportsGrid
        reports={filtered}
        loading={loading}
        isFiltered={search.trim() !== "" || filter !== "all"}
        view={view}
        onDelete={handleDelete}
      />
    </div>
  );
}
