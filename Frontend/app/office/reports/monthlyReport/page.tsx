
"use client";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast"; // use the same toast import as your daily report page
import RoleGuard from "@/app/components/RoleGuard";
import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";

import type {
  MonthlyReport,
  MonthlyStockRow,
  MonthlyDailySales,
  MonthlyProductSales,
} from "@/app/types/Report";
import { getMonthlyReport } from "@/app/services/reportService";
import { getStock } from "@/app/services/stockService";
import { CalendarDays } from "lucide-react";

const fmt = (n: number | undefined | null, dp = 2) =>
  (n ?? 0).toLocaleString("en-LK", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });

export default function MonthlyReportPage() {
  const now = new Date();
  const [ym, setYm] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [outletId, setOutletId] = useState("");
  const [outlets, setOutlets] = useState<string[]>([]);

  const load = async () => {
    const [year, month] = ym.split("-").map(Number);
    setLoading(true);
    setError(null);
    try {
      const data = await getMonthlyReport(year, month, outletId);
      setReport(data);
    } catch (e) {
      setReport(null);
      setError(
        e instanceof Error ? e.message : "Failed to load monthly report",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadOutlets() {
      const stock = await getStock();
      const unique = Array.from(new Set(stock.map((item) => item.outletId)));
      setOutlets(unique);
      setOutletId(unique[0] ?? "");
    }
    loadOutlets().catch(console.error);
  }, []);

  //Download report
  const exportPdf = async () => {
    const reportEl = printRef.current;
    if (!reportEl) {
      toast.error("Report not found");
      return;
    }

    setExporting(true);
    try {
      toast.loading("Generating PDF...", { id: "pdf" });

      // dynamic imports: both libraries touch `window`, so keep them out of SSR
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // margins in mm (left/right/top match the @page margin used by Print)
      const marginX = 10;
      const marginTop = 10;
      const marginBottom = 14; // extra room for the page-number footer

      const usableWidth = pageWidth - marginX * 2;
      const usableHeight = pageHeight - marginTop - marginBottom;

      // Render the report at a CSS width that maps to the PDF's usable width,
      // so the font size matches window.print() instead of looking shrunk.
      const DPI = 130;
      const MM_PER_PX = 25.4 / DPI;
      const REPORT_WIDTH = Math.round(usableWidth / MM_PER_PX);
      const PAGE_PX = Math.floor(usableHeight / MM_PER_PX); // one page, in CSS px

      // keep the canvas under the browser's max canvas height for long months
      const estHeight =
        (reportEl.scrollHeight * REPORT_WIDTH) / reportEl.offsetWidth;
      const scale = Math.max(1, Math.min(2, 15000 / estHeight));

      // measured inside the clone (CSS px from the top of the report)
      let breakPoints: number[] = [];
      let totalHeight = 0;

      const canvas = await html2canvas(reportEl, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: REPORT_WIDTH,
        onclone: (clonedDoc, clonedEl) => {
          clonedDoc.body.classList.add("printing-report");
          clonedEl.style.width = `${REPORT_WIDTH}px`;
          clonedEl.style.maxWidth = `${REPORT_WIDTH}px`;
          clonedEl.style.padding = "0"; // PDF margins handle spacing

          // Force desktop table layout regardless of clone viewport width
          clonedEl
            .querySelectorAll<HTMLElement>('[data-responsive-view="mobile"]')
            .forEach((el) => {
              el.style.display = "none";
            });
          clonedEl
            .querySelectorAll<HTMLElement>('[data-responsive-view="desktop"]')
            .forEach((el) => {
              el.style.display = "block";
            });

          // Same column widths in every table: wide first column, the rest
          // share the remaining space equally
          clonedEl.querySelectorAll<HTMLElement>("table").forEach((t) => {
            t.style.width = "100%";
            t.style.tableLayout = "fixed";
          });
          clonedEl
            .querySelectorAll<HTMLElement>(
              "table th:first-child, table td:first-child",
            )
            .forEach((c) => {
              c.style.width = "40%";
            });

          // Collect places where a page may safely break:
          // before each heading, and before table rows (never between a
          // heading / header row / first row, so they stay together)
          const top = clonedEl.getBoundingClientRect().top;
          totalHeight = clonedEl.getBoundingClientRect().height;
          const pts: number[] = [];

          clonedEl.querySelectorAll("h3").forEach((h) => {
            pts.push(h.getBoundingClientRect().top - top);
          });
          clonedEl.querySelectorAll("table").forEach((t) => {
            const rows = Array.from(t.rows).filter(
              (r) => r.parentElement?.tagName !== "THEAD",
            );
            rows.slice(1).forEach((r) => {
              const rect = r.getBoundingClientRect();
              if (rect.height > 0) pts.push(rect.top - top);
            });
          });
          breakPoints = pts.sort((a, b) => a - b);
        },
      });

      const s = canvas.width / REPORT_WIDTH; // actual canvas px per CSS px
      const total = Math.min(
        totalHeight || canvas.height / s,
        canvas.height / s,
      );

      // Split into pages at the last safe break point that fits on each page
      const pages: [number, number][] = [];
      let start = 0;
      while (total - start > 0.5) {
        let end = start + PAGE_PX;
        if (end >= total) {
          end = total;
        } else {
          const fit = breakPoints.filter(
            (p) => p > start + PAGE_PX * 0.4 && p <= end,
          );
          if (fit.length) end = fit[fit.length - 1];
        }
        pages.push([start, end]);
        start = end;
      }

      // Each page gets its own slice, encoded as JPEG (tiny vs raw PNG)
      pages.forEach(([a, b], i) => {
        const sy = Math.round(a * s);
        const sh = Math.min(Math.round((b - a) * s), canvas.height - sy);
        if (sh <= 0) return;

        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sh;
        const ctx = slice.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, sh);
        ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

        const img = slice.toDataURL("image/jpeg", 0.85);
        const h = (sh * usableWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(
          img,
          "JPEG",
          marginX,
          marginTop,
          usableWidth,
          h,
          undefined,
          "FAST",
        );
      });

      // Footer: page numbers inside the bottom margin
      const pageCount = pdf.getNumberOfPages();
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 6, {
          align: "center",
        });
      }

      pdf.save(`Monthly Sales Report ${outletId} (${ym}).pdf`);

      toast.success("Monthly report generated successfully!", { id: "pdf" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: "pdf" });
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const stockCols = (weighted: boolean): ColumnDef<MonthlyStockRow>[] => [
    { header: "Product", render: (r) => r.productName, cardRole: "title" },
    {
      header: "Opening",
      render: (r) => fmt(r.openingStock, weighted ? 3 : 0),
      align: "right",
    },
    {
      header: "Stock In",
      render: (r) => fmt(r.stockIn, weighted ? 3 : 0),
      align: "right",
    },
    {
      header: "Stock Out",
      render: (r) => fmt(r.stockOut, weighted ? 3 : 0),
      align: "right",
    },
    {
      header: "Closing",
      render: (r) => fmt(r.closingStock, weighted ? 3 : 0),
      align: "right",
    },
  ];

  const dailyCols: ColumnDef<MonthlyDailySales>[] = [
    { header: "Date", render: (r) => r.date, cardRole: "title" },
    {
      header: "Sales",
      render: (r) => String(r.saleCount),
      align: "right",
    },
    { header: "Revenue", render: (r) => fmt(r.revenue), align: "right" },
  ];

  const productCols: ColumnDef<MonthlyProductSales>[] = [
    { header: "Product", render: (r) => r.productName, cardRole: "title" },
    { header: "Type", render: (r) => r.priceType },
    {
      header: "Qty / Kg",
      render: (r) => fmt(r.quantity, r.weighted ? 3 : 0),
      align: "right",
    },
    { header: "Revenue", render: (r) => fmt(r.revenue), align: "right" },
  ];

  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }

          /* hide everything except the report (sidebar, navbar, toolbar...) */
          body * { visibility: hidden; }
          #monthly-report-print,
          #monthly-report-print * { visibility: visible; }
          #monthly-report-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }

          /* keep rows, headings and cards intact across pages */
          #monthly-report-print tr,
          #monthly-report-print article { break-inside: avoid; }
          #monthly-report-print h2,
          #monthly-report-print h3 { break-after: avoid; }
          #monthly-report-print thead { display: table-header-group; }

          /* keep row striping and colored headers when printing */
          #monthly-report-print * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="text-gray-800 p-4 space-y-4">
        <div className="flex gap-2 items-center mb-4">
          <CalendarDays className="size-8 text-red-900" />
          <h1 className="text-lg sm:text-xl text-red-950 font-bold  shrink-0">
            Monthly Sales Reports
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 items-center print:hidden">
          <input
            type="month"
            value={ym}
            onChange={(e) => setYm(e.target.value)}
            className="border-2 border-red-900 text-red-900 font-medium rounded p-2"
          />
          <select
            id="outletId"
            value={outletId}
            onChange={(e) => setOutletId(e.target.value)}
            className="w-full sm:w-auto border-2 border-red-900 text-red-900 font-medium rounded p-2"
          >
            {outlets.map((id) => (
              <option key={id} value={id} className="bg-red-50 text-gray-800">
                {id}
              </option>
            ))}
          </select>
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 bg-red-700 font-medium text-white rounded"
          >
            {loading ? "Loading…" : "Generate Monthly Report"}
          </button>

          {report && (
            <>
              <button
                onClick={exportPdf}
                disabled={exporting}
                className=" w-full sm:w-auto print:hidden bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                {exporting ? "Preparing PDF…" : "Download PDF"}
              </button>
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto print:hidden bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Print Report
              </button>
            </>
          )}
        </div>

        {error && (
          <p className="text-red-700 font-medium text-sm print:hidden">
            {error}
          </p>
        )}

        {report && (
          <div
            ref={printRef}
            id="monthly-report-print"
            className="space-y-6 bg-white p-4"
          >
            <div className="flex justify-between items-end border-b-2 pb-2">
              <h2 className="text-xl text-gray-900 font-semibold">
                Monthly Sales Report of {outletId}
              </h2>
              {/* <p className="text-base text-gray-700 font-semibold">{ym}</p> */}
              <p className="text-base text-gray-700 font-semibold">
                {(() => {
                  const [y, m] = ym.split("-").map(Number);
                  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  });
                })()}
              </p>
              <p className="text-sm text-gray-800 font-semibold">
                Generated at:{" "}
                {new Date().toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div
              className="grid grid-cols-2 md:grid-cols-5 gap-3 print:grid-cols-5"
              data-pdf-block
            >
              <Card
                label="Total Sales"
                value={fmt(report.summary.totalSales)}
              />
              <Card
                label="Discounts"
                value={fmt(report.summary.totalDiscount)}
              />
              <Card
                label="Transactions"
                value={String(report.summary.totalTransactions)}
              />
              <Card
                label="Cancelled"
                value={String(report.summary.cancelledCount)}
              />
              <Card label="Avg sale" value={fmt(report.summary.averageSale)} />
            </div>

            <div className="flex flex-col gap-4 mt-10">
              <h3 className="font-semibold text-base">Daily sales</h3>
              <ResponsiveDataView<MonthlyDailySales>
                columns={dailyCols}
                data={report.daily}
                getRowKey={(r) => r.date}
                emptyMessage="No sales this month"
              />
              <h3 className="font-semibold text-base mt-5">Sales by product</h3>
              <ResponsiveDataView<MonthlyProductSales>
                columns={productCols}
                data={report.products}
                getRowKey={(r) => `${r.barcode}-${r.priceType}`}
                emptyMessage="No product sales this month"
              />
              <h3 className="font-semibold text-base mt-5">Sausage Stock</h3>
              <ResponsiveDataView<MonthlyStockRow>
                columns={stockCols(false)}
                data={report.stock.nonWeightedItems}
                getRowKey={(r) => r.barcode}
              />
              <h3 className="font-semibold text-base mt-5">Chicken Stock</h3>
              <ResponsiveDataView<MonthlyStockRow>
                columns={stockCols(true)}
                data={report.stock.weightedItems}
                getRowKey={(r) => r.barcode}
              />
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-red-100  rounded p-3">
      <div className="text-xs text-red-900 font-semibold">{label}</div>
      <div className="text-xl text-gray-950 font-medium">{value}</div>
    </div>
  );
}
