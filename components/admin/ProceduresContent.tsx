"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface ProcedureFaq {
  question: string;
  answer: string;
}

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
  isArchived: boolean;
  order: number;
  durationMinutes: number;
  image?: string;
  benefits: string[];
  risks: string[];
  preparationInstructions?: string;
  recoveryTime?: string;
  faqs: ProcedureFaq[];
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
  durationMinutes: "30",
  benefits: [] as string[],
  risks: [] as string[],
  preparationInstructions: [] as string[],
  recoveryTime: "",
  faqs: [] as ProcedureFaq[],
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Add/edit/remove list of plain-text lines — used for Benefits, Risks, and Preparation Instructions. */
function LineListEditor({
  items,
  onAdd,
  onRemove,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
  placeholder?: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-xs">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-xs">
          <input
            type="text"
            value={item}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-sm py-xs rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="p-xs text-error hover:bg-error/10 rounded-lg transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="w-full py-xs border border-dashed border-outline-variant rounded-lg text-on-surface-variant text-caption hover:border-primary hover:text-primary transition-all"
      >
        + {addLabel}
      </button>
    </div>
  );
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
      durationMinutes: String(p.durationMinutes ?? 30),
      benefits: p.benefits ?? [],
      risks: p.risks ?? [],
      preparationInstructions: (p.preparationInstructions ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
      recoveryTime: p.recoveryTime ?? "",
      faqs: p.faqs ?? [],
    });
    setErrors({});
    setSlugTouched(true);
    setModalOpen(true);
  };

  const handleImageUpload = async (procedureId: string, file: File) => {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/procedures/${procedureId}/image`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload image");
        return;
      }
      setProcedures((prev) => prev.map((x) => (x._id === procedureId ? { ...x, image: data.procedure.image } : x)));
      toast.success("Procedure image updated");
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const addFaq = () => setForm((f) => ({ ...f, faqs: [...f.faqs, { question: "", answer: "" }] }));
  const removeFaq = (i: number) => setForm((f) => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }));
  const updateFaq = (i: number, field: "question" | "answer", value: string) =>
    setForm((f) => ({ ...f, faqs: f.faqs.map((faq, idx) => (idx === i ? { ...faq, [field]: value } : faq)) }));

  type LineListField = "benefits" | "risks" | "preparationInstructions";
  const addLine = (field: LineListField) => setForm((f) => ({ ...f, [field]: [...f[field], ""] }));
  const removeLine = (field: LineListField, i: number) =>
    setForm((f) => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));
  const updateLine = (field: LineListField, i: number, value: string) =>
    setForm((f) => ({ ...f, [field]: f[field].map((v, idx) => (idx === i ? value : v)) }));

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
        durationMinutes: Number(form.durationMinutes) || 30,
        benefits: form.benefits.map((s) => s.trim()).filter(Boolean),
        risks: form.risks.map((s) => s.trim()).filter(Boolean),
        preparationInstructions: form.preparationInstructions.map((s) => s.trim()).filter(Boolean).join("\n"),
        recoveryTime: form.recoveryTime.trim(),
        faqs: form.faqs.filter((f) => f.question.trim() && f.answer.trim()),
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
        <div className="overflow-x-auto overflow-y-auto max-h-150">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-1">
              <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                {["Name", "Location", "Price", "Original Price", "Discount", "Status", "Actions"].map((h, i, arr) => (
                  <th
                    key={h}
                    className={`px-md py-xs text-label-md text-on-surface-variant ${i === arr.length - 1 ? "text-right" : ""} ${h === "Name" ? "w-60" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {(() => {
                const visible = procedures;
                if (loading) {
                  return (
                    <tr>
                      <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                        Loading procedures…
                      </td>
                    </tr>
                  );
                }
                if (visible.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="px-md py-xl text-center text-on-surface-variant">
                        No procedures.
                      </td>
                    </tr>
                  );
                }
                return visible.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-xs whitespace-nowrap text-body-md font-semibold text-on-surface w-60">
                      <p className="max-w-60 truncate" title={p.name}>{p.name}</p>
                    </td>
                    <td className="px-md py-xs text-body-md text-on-surface-variant max-w-[220px] truncate">
                      {p.location}
                    </td>
                    <td className="px-md py-xs whitespace-nowrap text-body-md font-semibold text-primary">
                      Rs. {p.pricePkr.toLocaleString()}
                    </td>
                    <td className="px-md py-xs whitespace-nowrap text-body-md text-outline line-through">
                      Rs. {p.originalPricePkr.toLocaleString()}
                    </td>
                    <td className="px-md py-xs whitespace-nowrap text-body-md text-on-surface-variant">
                      {p.discountPercent}%
                    </td>
                    <td className="px-md py-xs whitespace-nowrap">
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
                    <td className="px-md py-xs text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <div className="relative group/tip">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-xs rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                            Edit
                          </span>
                        </div>
                        <div className="relative group/tip">
                          <button
                            onClick={() => setDeleteId(p._id)}
                            className="p-xs rounded-lg border border-error/20 text-error hover:bg-error/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                          <span className="pointer-events-none absolute bottom-full right-0 mb-xs whitespace-nowrap rounded-md bg-on-surface px-sm py-0.5 text-caption text-surface opacity-0 scale-95 transition-all group-hover/tip:opacity-100 group-hover/tip:scale-100 z-10">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit slide-over */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={() => setModalOpen(false)}>
          <div
            className="w-full max-w-2xl h-full bg-surface flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/30 shrink-0">
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

            <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-lg space-y-md">
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
                  <RichTextEditor
                    key={editId ?? "new"}
                    value={form.fullDescription}
                    onChange={(html) => setForm((f) => ({ ...f, fullDescription: html }))}
                    placeholder="Longer explanation for a procedure detail page"
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

              <div className="space-y-xs">
                <label className="text-label-md font-semibold text-on-surface-variant">
                  Default Duration (minutes) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                  className="w-full px-md py-sm rounded-lg border border-outline-variant/50 bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {editId && (
                <div className="space-y-xs">
                  <label className="text-label-md font-semibold text-on-surface-variant">Procedure Image</label>
                  <div className="flex items-center gap-md">
                    {procedures.find((p) => p._id === editId)?.image && (
                      <img
                        src={procedures.find((p) => p._id === editId)?.image}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover border border-outline-variant/30"
                      />
                    )}
                    <label className="px-md py-xs rounded-xl border border-outline-variant text-label-md font-semibold cursor-pointer hover:bg-surface-container-high transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(editId, e.target.files[0])}
                        disabled={busy}
                      />
                      {busy ? "Uploading…" : "Upload Image"}
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    Benefits <span className="text-caption text-outline">(Optional)</span>
                  </label>
                  <LineListEditor
                    items={form.benefits}
                    onAdd={() => addLine("benefits")}
                    onRemove={(i) => removeLine("benefits", i)}
                    onChange={(i, v) => updateLine("benefits", i, v)}
                    placeholder="e.g. Faster recovery"
                    addLabel="Add Benefit"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    Risks <span className="text-caption text-outline">(Optional)</span>
                  </label>
                  <LineListEditor
                    items={form.risks}
                    onAdd={() => addLine("risks")}
                    onRemove={(i) => removeLine("risks", i)}
                    onChange={(i, v) => updateLine("risks", i, v)}
                    placeholder="e.g. Mild discomfort"
                    addLabel="Add Risk"
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-semibold text-on-surface-variant">
                  Preparation Instructions <span className="text-caption text-outline">(Optional)</span>
                </label>
                <LineListEditor
                  items={form.preparationInstructions}
                  onAdd={() => addLine("preparationInstructions")}
                  onRemove={(i) => removeLine("preparationInstructions", i)}
                  onChange={(i, v) => updateLine("preparationInstructions", i, v)}
                  placeholder="e.g. Fast for 8 hours before the procedure"
                  addLabel="Add Instruction"
                />
              </div>

              <div className="space-y-xs">
                <label className="text-label-md font-semibold text-on-surface-variant">
                  Recovery Time <span className="text-caption text-outline">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.recoveryTime}
                  onChange={(e) => setForm((f) => ({ ...f, recoveryTime: e.target.value }))}
                  placeholder="e.g. 24-48 hours"
                  className="w-full px-md py-sm rounded-lg border border-outline-variant/50 bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-xs">
                <div className="flex items-center justify-between">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    FAQs <span className="text-caption text-outline">(Optional)</span>
                  </label>
                  <button type="button" onClick={addFaq} className="text-label-md font-semibold text-primary hover:underline">
                    + Add FAQ
                  </button>
                </div>
                {form.faqs.map((faq, i) => (
                  <div key={i} className="p-sm rounded-lg border border-outline-variant/30 space-y-xs">
                    <div className="flex items-center gap-xs">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(i, "question", e.target.value)}
                        placeholder="Question"
                        className="flex-1 px-sm py-xs rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-body-md"
                      />
                      <button type="button" onClick={() => removeFaq(i)} className="p-xs text-error">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaq(i, "answer", e.target.value)}
                      placeholder="Answer"
                      className="w-full px-sm py-xs rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-body-md resize-none"
                    />
                  </div>
                ))}
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
            </div>

              <div className="flex gap-sm justify-end px-lg py-md border-t border-outline-variant/30 shrink-0">
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
