import type jsPDF from "jspdf";

export interface PdfDoctorInfo {
  name: string;
  designation: string;
  contactPhone?: string;
  contactEmail?: string;
}

export const PDF_COLORS = {
  // Matches the Reports PDF export's teal brand color (app primary), not a literal navy.
  navy: [19, 78, 74] as [number, number, number],
  navyLight: [15, 118, 110] as [number, number, number],
  textDark: [24, 28, 38] as [number, number, number],
  textMuted: [110, 114, 130] as [number, number, number],
  border: [226, 230, 238] as [number, number, number],
  rowAlt: [244, 247, 250] as [number, number, number],
};

function pillColors(raw: string): { bg: [number, number, number]; text: [number, number, number] } | null {
  const v = raw.trim().toLowerCase();
  if (["confirmed", "verified", "active"].includes(v)) return { bg: [220, 252, 231], text: [21, 128, 61] };
  if (v === "completed") return { bg: [219, 234, 254], text: [30, 64, 175] };
  if (["pending payment", "payment submitted", "payment verification", "pending", "submitted", "follow-up"].includes(v))
    return { bg: [255, 237, 213], text: [194, 65, 12] };
  if (["cancelled", "rejected", "no show", "failed"].includes(v)) return { bg: [254, 226, 226], text: [185, 28, 28] };
  if (v === "rescheduled") return { bg: [237, 233, 254], text: [91, 33, 182] };
  if (v === "refunded" || v === "new") return { bg: [229, 231, 235], text: [55, 65, 81] };
  return null;
}

/**
 * Builds a jsPDF document pre-styled with a branded navy letterhead (logo-initial
 * badge, doctor name/designation/contact, report title + timestamp repeated on
 * every page) and a `renderTable` helper that draws striped, badge-aware tables —
 * shared by every admin PDF export so they all look like one system.
 */
export async function createLetterheadPdf(
  doctor: PdfDoctorInfo,
  opts: { title: string; orientation?: "landscape" | "portrait" }
) {
  const { default: jsPDFCtor } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc: jsPDF = new jsPDFCtor({ orientation: opts.orientation ?? "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const HEADER_H = 28;
  const { navy, navyLight, textDark, textMuted, border, rowAlt } = PDF_COLORS;

  const initials = doctor.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "DR";
  const generatedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  function drawHeader() {
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageWidth, HEADER_H, "F");
    doc.setFillColor(...navyLight);
    doc.triangle(pageWidth * 0.65, HEADER_H, pageWidth, HEADER_H, pageWidth, HEADER_H * 0.2, "F");

    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 7, HEADER_H / 2, 7, "F");
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(initials, margin + 7, HEADER_H / 2 + 1.3, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(doctor.name, margin + 18, HEADER_H / 2 - 3);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(doctor.designation, margin + 18, HEADER_H / 2 + 2);
    doc.setFontSize(7);
    doc.text([doctor.contactPhone, doctor.contactEmail].filter(Boolean).join("   ·   "), margin + 18, HEADER_H / 2 + 6.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(opts.title, pageWidth - margin, HEADER_H / 2 - 2, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`Generated: ${generatedAt}`, pageWidth - margin, HEADER_H / 2 + 4, { align: "right" });

    doc.setTextColor(0, 0, 0);
  }

  function drawFooter() {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(...border);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...textMuted);
      doc.text("Confidential — for internal clinical use only", margin, pageHeight - 7);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    }
  }

  /** Draws a section title with an underline rule; returns the Y to start content at. */
  function drawSectionTitle(title: string, y: number): number {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text(title, margin, y);
    doc.setDrawColor(...border);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    doc.setTextColor(...textDark);
    return y + 7;
  }

  function renderTable(params: {
    startY: number;
    headers: string[];
    rows: (string | number)[][];
    fontSize?: number;
    badgeColumns?: string[];
  }): number {
    const fontSize = params.fontSize ?? 8;
    const badgeSet = new Set(params.badgeColumns ?? []);
    const badgeCols = new Set(params.headers.map((h, i) => (badgeSet.has(h) ? i : -1)).filter((i) => i >= 0));

    autoTable(doc, {
      startY: params.startY,
      head: [params.headers],
      body: params.rows,
      theme: "striped",
      styles: { fontSize, cellPadding: 2.5, textColor: textDark, lineColor: border, lineWidth: 0.1 },
      headStyles: { fillColor: navy, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: rowAlt },
      // Only page 1 gets the top margin reserved for the letterhead header
      // (drawn once, see didDrawPage below) — later pages start near the top.
      margin: { left: margin, right: margin, top: 16 },
      didParseCell: (data) => {
        if (data.section === "body" && badgeCols.has(data.column.index)) {
          data.cell.text = [""];
        }
      },
      didDrawCell: (data) => {
        if (data.section !== "body" || !badgeCols.has(data.column.index)) return;
        const raw = String(data.cell.raw ?? "").trim();
        if (!raw || raw === "—") return;
        const style = pillColors(raw);
        if (!style) return;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(Math.max(6, fontSize - 0.5));
        const textW = doc.getTextWidth(raw);
        const pillW = textW + 4.4;
        const pillH = data.cell.height - 3;
        const px = data.cell.x + (data.cell.width - pillW) / 2;
        const py = data.cell.y + (data.cell.height - pillH) / 2;
        doc.setFillColor(...style.bg);
        doc.roundedRect(px, py, pillW, pillH, pillH / 2, pillH / 2, "F");
        doc.setTextColor(...style.text);
        doc.text(raw, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" });
        doc.setTextColor(...textDark);
      },
      // Letterhead header only on the first page, matching the Reports PDF export.
      didDrawPage: () => {
        if (doc.getCurrentPageInfo().pageNumber === 1) drawHeader();
      },
    });

    return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  }

  drawHeader();

  return {
    doc,
    pageWidth,
    margin,
    contentWidth,
    headerHeight: HEADER_H,
    colors: PDF_COLORS,
    renderTable,
    drawHeader,
    drawFooter,
    drawSectionTitle,
  };
}
