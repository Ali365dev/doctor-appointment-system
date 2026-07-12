"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Procedure {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  location: string;
  pricePkr: number;
  originalPricePkr: number;
  discountPercent: number;
  isActive: boolean;
  order: number;
}

interface Clinic {
  _id: string;
  name: string;
  city: string;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  location: "",
  originalPricePkr: "",
  discountPercent: "",
  isActive: true,
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProceduresContent() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const loadProcedures = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/procedures");
      const data = await res.json();
      if (res.ok) setProcedures(data.procedures ?? []);
      else toast.error(data.error ?? "Could not load procedures");
    } catch {
      toast.error("Network error loading procedures");
    } finally {
      setLoading(false);
    }
  };

  const loadClinics = async () => {
    try {
      const res = await fetch("/api/clinics");
      const data = await res.json();
      if (res.ok) setClinics(data.clinics ?? []);
    } catch {
      // Location dropdown just won't populate — not fatal.
    }
  };

  useEffect(() => {
    loadProcedures();
    loadClinics();
  }, []);

  const clinicLocation = (c: Clinic) => `${c.name}, ${c.city}`;

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSlugTouched(false);
    setModalOpen(true);
  };

  const openEdit = (p: Procedure) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      slug: p.slug ?? "",
      shortDescription: p.shortDescription ?? "",
      fullDescription: p.fullDescription ?? "",
      location: p.location,
      originalPricePkr: String(p.originalPricePkr),
      discountPercent: p.discountPercent ? String(p.discountPercent) : "",
      isActive: p.isActive,
    });
    setErrors({});
    setSlugTouched(true);
    setModalOpen(true);
  };

  // Discount is optional; price with no discount is just the original price.
  const discountValue = form.discountPercent === "" ? 0 : Number(form.discountPercent);
  const computedPrice = form.originalPricePkr
    ? Math.round(Number(form.originalPricePkr) * (1 - discountValue / 100))
    : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.slug.trim() && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugify(form.slug))) {
      e.slug = "Slug must be lowercase letters, numbers, and hyphens only";
    }
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.originalPricePkr || Number(form.originalPricePkr) < 0) e.originalPricePkr = "Enter a valid original price";
    if (form.discountPercent !== "" && (Number(form.discountPercent) < 0 || Number(form.discountPercent) > 100)) {
      e.discountPercent = "Discount must be between 0 and 100";
    }
    setErrors(e);
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setBusy(true);
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim() ? slugify(form.slug) : slugify(form.name),
        shortDescription: form.shortDescription.trim(),
        fullDescription: form.fullDescription.trim(),
        location: form.location.trim(),
        originalPricePkr: Number(form.originalPricePkr),
        discountPercent: discountValue,
        isActive: form.isActive,
      };

      const res = await fetch(editId ? `/api/procedures/${editId}` : "/api/procedures", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save procedure");
        return;
      }
      toast.success(editId ? "Procedure updated" : "Procedure added");
      setModalOpen(false);
      await loadProcedures();
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (p: Procedure) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/procedures/${p._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not update procedure");
        return;
      }
      setProcedures((prev) => prev.map((x) => (x._id === p._id ? { ...x, isActive: !x.isActive } : x)));
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/procedures/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not delete procedure");
        return;
      }
      toast.success("Procedure deleted");
      setDeleteId(null);
      setProcedures((prev) => prev.filter((p) => p._id !== deleteId));
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-gutter py-lg max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Procedures & Transparency</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {procedures.length} total · manage what shows on the public Services page
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-xs px-md py-xs rounded-xl bg-primary text-on-primary font-semibold hover:shadow-lg transition-all"
        >
          <span className="material-symbols-outlined">add</span> Add Procedure
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                {["Name", "Location", "Price", "Original Price", "Discount", "Status", "Actions"].map((h, i, arr) => (
                  <th key={h} className={`px-md py-md text-label-md text-on-surface-variant ${i === arr.length - 1 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    Loading procedures…
                  </td>
                </tr>
              ) : procedures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                    No procedures yet. Click &ldquo;Add Procedure&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                procedures.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-md whitespace-nowrap text-body-md font-semibold text-on-surface">
                      {p.name}
                    </td>
                    <td className="px-md py-md text-body-md text-on-surface-variant max-w-[220px] truncate">
                      {p.location}
                    </td>
                    <td className="px-md py-md whitespace-nowrap text-body-md font-semibold text-primary">
                      Rs. {p.pricePkr.toLocaleString()}
                    </td>
                    <td className="px-md py-md whitespace-nowrap text-body-md text-outline line-through">
                      Rs. {p.originalPricePkr.toLocaleString()}
                    </td>
                    <td className="px-md py-md whitespace-nowrap text-body-md text-on-surface-variant">
                      {p.discountPercent}%
                    </td>
                    <td className="px-md py-md whitespace-nowrap">
                      <button
                        disabled={busy}
                        onClick={() => toggleActive(p)}
                        className={`px-sm py-[2px] rounded-full text-caption font-bold transition-colors ${
                          p.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        {p.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-md py-md text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(p._id)}
                          className="p-xs rounded-lg border border-error/20 text-error hover:bg-error/10 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-md">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full mx-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/30 sticky top-0 bg-surface z-10">
              <h3 className="text-headline-md font-bold text-on-surface">
                {editId ? "Edit Procedure" : "Add Procedure"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-xs rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-lg space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md font-semibold text-on-surface-variant">
                  Procedure Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
                  }}
                  placeholder="e.g. Colonoscopy"
                  className={`w-full px-md py-sm rounded-lg border bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.name ? "border-error" : "border-outline-variant/50"
                  }`}
                />
                {errors.name && <p className="text-caption text-error">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="space-y-md p-md rounded-xl bg-surface-container-low/50 border border-outline-variant/20">
                <h4 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wide">
                  Description
                </h4>

                <div className="space-y-xs">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    Slug <span className="text-caption text-outline">(Optional — auto-generated from name)</span>
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setForm((f) => ({ ...f, slug: e.target.value }));
                    }}
                    placeholder={slugify(form.name) || "e.g. colonoscopy"}
                    className={`w-full px-md py-sm rounded-lg border bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.slug ? "border-error" : "border-outline-variant/50"
                    }`}
                  />
                  {errors.slug && <p className="text-caption text-error">{errors.slug}</p>}
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    Short Description <span className="text-caption text-outline">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                    placeholder="One line shown on the procedure card"
                    className="w-full px-md py-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    Full Description <span className="text-caption text-outline">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.fullDescription}
                    onChange={(e) => setForm((f) => ({ ...f, fullDescription: e.target.value }))}
                    placeholder="Longer explanation for a procedure detail page"
                    className="w-full px-md py-sm rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-semibold text-on-surface-variant">
                  Location <span className="text-error">*</span>
                </label>
                <select
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className={`w-full px-md py-sm rounded-lg border bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                    errors.location ? "border-error" : "border-outline-variant/50"
                  }`}
                >
                  <option value="">Select a clinic…</option>
                  {clinics.map((c) => (
                    <option key={c._id} value={clinicLocation(c)}>
                      {clinicLocation(c)}
                    </option>
                  ))}
                  {/* Keep a saved location selectable even if its clinic isn't in the list anymore. */}
                  {form.location && !clinics.some((c) => clinicLocation(c) === form.location) && (
                    <option value={form.location}>{form.location}</option>
                  )}
                </select>
                {errors.location && <p className="text-caption text-error">{errors.location}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    Original Price (PKR) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.originalPricePkr}
                    onChange={(e) => setForm((f) => ({ ...f, originalPricePkr: e.target.value }))}
                    className={`w-full px-md py-sm rounded-lg border bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.originalPricePkr ? "border-error" : "border-outline-variant/50"
                    }`}
                  />
                  {errors.originalPricePkr && <p className="text-caption text-error">{errors.originalPricePkr}</p>}
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    Discount % <span className="text-caption text-outline">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercent}
                    onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                    placeholder="0"
                    className={`w-full px-md py-sm rounded-lg border bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      errors.discountPercent ? "border-error" : "border-outline-variant/50"
                    }`}
                  />
                  {errors.discountPercent && <p className="text-caption text-error">{errors.discountPercent}</p>}
                </div>
              </div>

              {/* Auto-calculated: original price minus the discount, or equal to it when no discount is set. */}
              <div className="flex items-center gap-sm p-sm bg-primary/5 rounded-xl border border-primary/10">
                <span className="material-symbols-outlined text-primary">payments</span>
                <div>
                  <p className="text-caption text-on-surface-variant">Price shown to patients (auto-calculated)</p>
                  <p className="text-headline-md font-bold text-primary">
                    {computedPrice !== null ? `Rs. ${computedPrice.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-label-md font-semibold text-on-surface-variant">
                  Visible on public Services page
                </span>
              </label>

              <div className="flex gap-sm justify-end pt-md">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-md py-xs rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-md py-xs rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 disabled:opacity-60"
                >
                  {busy ? "Saving…" : editId ? "Save Changes" : "Add Procedure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-surface rounded-2xl p-lg shadow-2xl max-w-sm w-full mx-md">
            <h3 className="text-headline-md font-bold text-on-surface mb-sm">Delete Procedure?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">
              This will permanently remove{" "}
              <span className="font-semibold text-on-surface">
                {procedures.find((p) => p._id === deleteId)?.name}
              </span>{" "}
              from the Services page. This action cannot be undone.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-md py-xs rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={handleDelete}
                className="px-md py-xs rounded-xl bg-error text-on-error font-semibold hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
