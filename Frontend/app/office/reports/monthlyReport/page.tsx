// "use client";
// import { useEffect, useRef, useState } from "react";
// import RoleGuard from "@/app/components/RoleGuard";
// import ResponsiveDataView, {
//   ColumnDef,
// } from "@/app/components/ResponsiveDataView";

// import type {
//   MonthlyReport,
//   MonthlyStockRow,
//   MonthlyDailySales,
//   MonthlyProductSales,
// } from "@/app/types/Report";
// import { getMonthlyReport } from "@/app/services/reportService";
// import { getStock } from "@/app/services/stockService";

// const fmt = (n: number | undefined | null, dp = 2) =>
//   (n ?? 0).toLocaleString("en-LK", {
//     minimumFractionDigits: dp,
//     maximumFractionDigits: dp,
//   });

// export default function MonthlyReportPage() {
//   const now = new Date();
//   const [ym, setYm] = useState(
//     `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
//   );
//   const [report, setReport] = useState<MonthlyReport | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const printRef = useRef<HTMLDivElement>(null);
//   const [outletId, setOutletId] = useState(""); // TODO: use the same outlet source as your day-end report page
//   const [outlets, setOutlets] = useState<string[]>([]);

//   const load = async () => {
//     const [year, month] = ym.split("-").map(Number);
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getMonthlyReport(year, month, outletId);
//       setReport(data);
//     } catch (e) {
//       setReport(null);
//       setError(
//         e instanceof Error ? e.message : "Failed to load monthly report",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     async function loadOutlets() {
//       const stock = await getStock();
//       const unique = Array.from(new Set(stock.map((item) => item.outletId)));
//       setOutlets(unique);
//       setOutletId(unique[0] ?? "");
//     }
//     loadOutlets().catch(console.error);
//   }, []);

//   const exportPdf = async () => {
//     const el = printRef.current;
//     if (!el) return;
//     setExporting(true);
//     try {
//       // dynamic imports: both libraries touch `window`, so keep them out of SSR
//       const html2canvas = (await import("html2canvas-pro")).default;
//       const { jsPDF } = await import("jspdf");

//       const scale = 2;
//       const canvas = await html2canvas(el, {
//         scale,
//         backgroundColor: "#ffffff",
//         useCORS: true,
//       });

//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageW = pdf.internal.pageSize.getWidth();
//       const pageH = pdf.internal.pageSize.getHeight();
//       const margin = 10;
//       const imgW = pageW - margin * 2;
//       const pxPerMm = canvas.width / imgW;
//       const pageHpx = Math.floor((pageH - margin * 2) * pxPerMm);

//       // Safe places to cut a page: the bottom edge of every table row / card / heading
//       const elTop = el.getBoundingClientRect().top;
//       const breaks = Array.from(
//         el.querySelectorAll("tr, article, h2, h3, [data-pdf-block]"),
//       )
//         .map((n) =>
//           Math.round((n.getBoundingClientRect().bottom - elTop) * scale),
//         )
//         .sort((a, b) => a - b);

//       let y = 0;
//       let page = 0;
//       while (y < canvas.height) {
//         let end = Math.min(y + pageHpx, canvas.height);
//         if (end < canvas.height) {
//           // cut at the last row boundary that fits, but not in the top half of the page
//           const safe = breaks
//             .filter((b) => b > y + pageHpx * 0.5 && b <= end)
//             .pop();
//           if (safe) end = safe;
//         }
//         const sliceH = end - y;

//         const slice = document.createElement("canvas");
//         slice.width = canvas.width;
//         slice.height = sliceH;
//         slice
//           .getContext("2d")!
//           .drawImage(
//             canvas,
//             0,
//             y,
//             canvas.width,
//             sliceH,
//             0,
//             0,
//             canvas.width,
//             sliceH,
//           );

//         if (page > 0) pdf.addPage();
//         pdf.addImage(
//           slice.toDataURL("image/jpeg", 0.92),
//           "JPEG",
//           margin,
//           margin,
//           imgW,
//           sliceH / pxPerMm,
//         );

//         y = end;
//         page++;
//       }

//       pdf.save(`Monthly-report-of-${outletId}-${ym}.pdf`);
//     } finally {
//       setExporting(false);
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const stockCols = (weighted: boolean): ColumnDef<MonthlyStockRow>[] => [
//     { header: "Product", render: (r) => r.productName, cardRole: "title" },
//     {
//       header: "Opening",
//       render: (r) => fmt(r.openingStock, weighted ? 3 : 0),
//       align: "right",
//     },
//     {
//       header: "Stock In",
//       render: (r) => fmt(r.stockIn, weighted ? 3 : 0),
//       align: "right",
//     },
//     {
//       header: "Stock Out",
//       render: (r) => fmt(r.stockOut, weighted ? 3 : 0),
//       align: "right",
//     },
//     {
//       header: "Closing",
//       render: (r) => fmt(r.closingStock, weighted ? 3 : 0),
//       align: "right",
//     },
//   ];

//   const dailyCols: ColumnDef<MonthlyDailySales>[] = [
//     { header: "Date", render: (r) => r.date, cardRole: "title" },
//     {
//       header: "Sales",
//       render: (r) => String(r.saleCount),
//       align: "right",
//     },
//     { header: "Revenue", render: (r) => fmt(r.revenue), align: "right" },
//   ];

//   const productCols: ColumnDef<MonthlyProductSales>[] = [
//     { header: "Product", render: (r) => r.productName, cardRole: "title" },
//     { header: "Type", render: (r) => r.priceType },
//     {
//       header: "Qty / Kg",
//       render: (r) => fmt(r.quantity, r.weighted ? 3 : 0),
//       align: "right",
//     },
//     { header: "Revenue", render: (r) => fmt(r.revenue), align: "right" },
//   ];

//   return (
//     <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
//       <div className="text-gray-800 p-4 space-y-4">
//         <div className="flex gap-2 items-center">
//           <input
//             type="month"
//             value={ym}
//             onChange={(e) => setYm(e.target.value)}
//             className="border-2 border-red-900 text-red-900 font-medium rounded p-2"
//           />
//           <select
//             id="outletId"
//             value={outletId}
//             onChange={(e) => setOutletId(e.target.value)}
//             className="w-full sm:w-auto border-2 border-red-900 text-red-900 font-medium rounded p-2"
//           >
//             {outlets.map((id) => (
//               <option key={id} value={id} className="bg-red-50 text-gray-800">
//                 {id}
//               </option>
//             ))}
//           </select>
//           <button
//             onClick={load}
//             disabled={loading}
//             className="px-4 py-2 bg-red-700 border-2 font-medium border-red-700 text-white rounded"
//           >
//             {loading ? "Loading…" : "Generate"}
//           </button>

//           {report && (
//             <>
//               <button
//                 onClick={exportPdf}
//                 disabled={exporting}
//                 className="px-4 py-2 border-2 font-medium text-red-900 rounded"
//               >
//                 {exporting ? "Preparing PDF…" : "Download PDF"}
//               </button>
//               <button
//                 onClick={handlePrint}
//                 className="px-3 py-1 border rounded"
//               >
//                 Print
//               </button>
//             </>
//           )}
//         </div>

//         {error && <p className="text-red-700 font-medium text-sm">{error}</p>}

//         {report && (
//           <div
//             ref={printRef}
//             id="monthly-report-print"
//             className="space-y-6 bg-white p-4"
//           >
//             <h2 className="text-xl text-gray-900 font-semibold">
//               Monthly Report — {ym}
//             </h2>

//             <div
//               className="grid grid-cols-2 md:grid-cols-5 gap-3"
//               data-pdf-block
//             >
//               <Card
//                 label="Total Sales"
//                 value={fmt(report.summary.totalSales)}
//               />
//               <Card
//                 label="Discounts"
//                 value={fmt(report.summary.totalDiscount)}
//               />
//               <Card
//                 label="Transactions"
//                 value={String(report.summary.totalTransactions)}
//               />
//               <Card
//                 label="Cancelled"
//                 value={String(report.summary.cancelledCount)}
//               />
//               <Card label="Avg sale" value={fmt(report.summary.averageSale)} />
//             </div>

//             <div className="flex flex-col gap-4 mt-10">
//               <h3 className="font-semibold text-base">Daily sales</h3>
//               <ResponsiveDataView<MonthlyDailySales>
//                 columns={dailyCols}
//                 data={report.daily}
//                 getRowKey={(r) => r.date}
//                 emptyMessage="No sales this month"
//               />
//               <h3 className="font-semibold text-base mt-5">Sales by product</h3>
//               <ResponsiveDataView<MonthlyProductSales>
//                 columns={productCols}
//                 data={report.products}
//                 getRowKey={(r) => `${r.barcode}-${r.priceType}`}
//                 emptyMessage="No product sales this month"
//               />
//               <h3 className="font-semibold text-base mt-5">Sausage Stock</h3>
//               <ResponsiveDataView<MonthlyStockRow>
//                 columns={stockCols(false)}
//                 data={report.stock.nonWeightedItems}
//                 getRowKey={(r) => r.barcode}
//               />
//               <h3 className="font-semibold text-base mt-5">Chicken Stock</h3>
//               <ResponsiveDataView<MonthlyStockRow>
//                 columns={stockCols(true)}
//                 data={report.stock.weightedItems}
//                 getRowKey={(r) => r.barcode}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </RoleGuard>
//   );
// }

// function Card({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="bg-red-50 border border-red-700 drop-shadow-lg rounded p-3">
//       <div className="text-xs text-red-900 font-semibold">{label}</div>
//       <div className="text-xl text-gray-950 font-medium">{value}</div>
//     </div>
//   );
// }
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
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const marginX = 8;
      const marginY = 10;

      const usableWidth = pageWidth - marginX * 2;
      const usableHeight = pageHeight - marginY * 2;

      // Render the report at a CSS width that maps to the PDF's usable width,
      // so the font size matches window.print() instead of looking shrunk.
      const DPI = 130;
      const MM_PER_PX = 25.4 / DPI;
      const REPORT_WIDTH = Math.round(usableWidth / MM_PER_PX);

      const canvas = await html2canvas(reportEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: REPORT_WIDTH,
        onclone: (clonedDoc, clonedEl) => {
          clonedDoc.body.classList.add("printing-report");
          clonedEl.style.width = `${REPORT_WIDTH}px`;
          clonedEl.style.maxWidth = `${REPORT_WIDTH}px`;

          // Force desktop table layout regardless of clone viewport width
          clonedEl
            .querySelectorAll('[data-responsive-view="mobile"]')
            .forEach((el) => {
              (el as HTMLElement).style.display = "none";
            });
          clonedEl
            .querySelectorAll('[data-responsive-view="desktop"]')
            .forEach((el) => {
              (el as HTMLElement).style.display = "block";
            });
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = marginY;

      pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        position = marginY - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
        heightLeft -= usableHeight;
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
            <div className="flex justify-between items-end border-b-2 border-red-900 pb-2">
              <h2 className="text-xl text-gray-900 font-semibold">
                Monthly Sales Report
              </h2>
              <p className="text-sm text-gray-700 font-medium">
                {outletId} — {ym}
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
    <div className="bg-red-50  rounded p-3">
      <div className="text-xs text-red-900 font-semibold">{label}</div>
      <div className="text-xl text-gray-950 font-medium">{value}</div>
    </div>
  );
}
