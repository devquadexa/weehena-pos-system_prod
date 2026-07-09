"use client";

import { useEffect, useState } from "react";
import { getDayEndStockReport } from "@/app/services/reportService";
import Button from "@/app/components/Button";
import { getStock } from "@/app/services/stockService";
import { DayEndStockReport } from "@/app/types/Report";
import { ProductSaleData } from "@/app/types/Sale";
import ProductSaleModal from "@/app/components/ProductSaleModal";
import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";
import toast from "react-hot-toast";
import { Layers } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export default function StockReportPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [outlet, setOutlet] = useState("");
  const [outlets, setOutlets] = useState<string[]>([]);
  const [reports, setReports] = useState<DayEndStockReport[]>([]);
  const [loading, setLoading] = useState(false);

  const [sales, setSales] = useState<ProductSaleData[]>([]);

  const [showModal, setShowModal] = useState(false);

  const handleFetchStockReport = async () => {
    try {
      setReports([]);
      setLoading(true);
      const stockReportData = await getDayEndStockReport(date, outlet);
      setReports(stockReportData);
      console.log("Report data:", stockReportData);
    } catch (err) {
      console.error("Failed to load report:", err);
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadOutlets() {
      const stock = await getStock();
      const unique = Array.from(new Set(stock.map((item) => item.outletId)));
      setOutlets(unique);
      setOutlet(unique[0] ?? "");
    }
    loadOutlets().catch(console.error);
  }, []);

  const printReport = () => {
    document.body.classList.add("printing-report");

    document.title = `Day-End Stock Report of ${outlet} (${date})`;

    window.print();
    document.body.classList.remove("printing-report");
  };

  //Download report
  const saveReportAsPDF = async () => {
    const report = document.getElementById("report-print");
    if (!report) {
      toast.error("Report not found");
      return;
    }

    try {
      toast.loading("Generating PDF...", { id: "pdf" });

      const DPI = 130;
      const SCALE = 2;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 8;
      const marginY = 10;
      const usableWidth = pageWidth - marginX * 2;

      const REPORT_WIDTH = Math.round(usableWidth / (25.4 / DPI));

      // Collected during onclone, in *clone px* (unscaled).
      let rowBottoms: number[] = [];
      const tables: {
        headerTop: number;
        headerBottom: number;
        bodyBottom: number;
      }[] = [];

      const canvas = await html2canvas(report, {
        scale: SCALE,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: REPORT_WIDTH,
        onclone: (clonedDoc, clonedEl) => {
          clonedDoc.body.classList.add("printing-report");
          clonedEl.style.width = `${REPORT_WIDTH}px`;
          clonedEl.style.maxWidth = `${REPORT_WIDTH}px`;

          clonedEl
            .querySelectorAll('[data-responsive-view="mobile"]')
            .forEach((el) => ((el as HTMLElement).style.display = "none"));
          clonedEl
            .querySelectorAll('[data-responsive-view="desktop"]')
            .forEach((el) => ((el as HTMLElement).style.display = "block"));

          const top = clonedEl.getBoundingClientRect().top;

          clonedEl.querySelectorAll("table").forEach((table) => {
            const thead = table.querySelector("thead");
            const rows = table.querySelectorAll("tbody tr");
            if (!thead || rows.length === 0) return;

            const headerRect = thead.getBoundingClientRect();
            const lastRowRect = rows[rows.length - 1].getBoundingClientRect();

            tables.push({
              headerTop: headerRect.top - top,
              headerBottom: headerRect.bottom - top,
              bodyBottom: lastRowRect.bottom - top,
            });

            rows.forEach((tr) => {
              rowBottoms.push(
                (tr as HTMLElement).getBoundingClientRect().bottom - top,
              );
            });
          });
        },
      });

      // Scale everything to actual canvas pixels.
      const px = (v: number) => v * SCALE;
      rowBottoms = rowBottoms.map(px).sort((a, b) => a - b);
      const tableRegions = tables.map((t) => ({
        headerTop: px(t.headerTop),
        headerBottom: px(t.headerBottom),
        bodyBottom: px(t.bodyBottom),
      }));

      const imgW = canvas.width;
      const imgH = canvas.height;
      const pxPerMm = imgW / usableWidth;

      // Crop a horizontal strip [fromPx, toPx) out of the master canvas
      // and return it as a PNG data URL.
      const cropStrip = (fromPx: number, toPx: number) => {
        const h = toPx - fromPx;
        const c = document.createElement("canvas");
        c.width = imgW;
        c.height = h;
        c.getContext("2d")!.drawImage(
          canvas,
          0,
          fromPx,
          imgW,
          h,
          0,
          0,
          imgW,
          h,
        );
        return { dataUrl: c.toDataURL("image/png"), heightMm: h / pxPerMm };
      };

      // Is y currently inside some table's body (i.e. we're mid-table,
      // past its header, before its last row)? Returns that table's
      // header region, or null if y isn't inside any table body.
      const findActiveTableHeader = (y: number) =>
        tableRegions.find((t) => y > t.headerBottom && y < t.bodyBottom) ??
        null;

      let cursorPx = 0;
      let pageNum = 0;

      while (cursorPx < imgH - 1) {
        if (pageNum > 0) pdf.addPage();

        let y = marginY;

        // Repeat the header if a table is being continued onto this page.
        const activeHeader =
          pageNum > 0 ? findActiveTableHeader(cursorPx) : null;
        if (activeHeader) {
          const { dataUrl, heightMm } = cropStrip(
            activeHeader.headerTop,
            activeHeader.headerBottom,
          );
          pdf.addImage(dataUrl, "PNG", marginX, y, usableWidth, heightMm);
          y += heightMm;
        }

        // How much body space is left on this page after the header (if any)?
        const remainingPx =
          (pageHeight - marginY - (y - marginY) - marginY) * pxPerMm;
        const idealEnd = Math.min(cursorPx + remainingPx, imgH);

        // Snap the cut to the last row boundary that fits, so no row is split.
        const fittingRow = [...rowBottoms]
          .reverse()
          .find((r) => r > cursorPx && r <= idealEnd);
        const cutoff = fittingRow ?? idealEnd;

        const { dataUrl, heightMm } = cropStrip(cursorPx, cutoff);
        pdf.addImage(dataUrl, "PNG", marginX, y, usableWidth, heightMm);

        cursorPx = cutoff;
        pageNum++;
      }

      pdf.save(`Daily Sales Report ${outlet} (${date}).pdf`);
      toast.success("Sales Report generated successfully!", { id: "pdf" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: "pdf" });
    }
  };

  const openProductSales = async (barcode: string) => {
    const res = await fetch(
      `https://weehenapos360.cloud/api/reports/product-sales?barcode=${barcode}&outletId=${outlet}&date=${date}`,
    );

    //Test URL
    // const res = await fetch(
    //   `http://localhost:8080/api/reports/product-sales?barcode=${barcode}&outletId=${outlet}&date=${date}`,
    // );

    const data = await res.json();

    setSales(data);

    setShowModal(true);
  };

  const stockReportColumns: ColumnDef<DayEndStockReport>[] = [
    {
      header: "Barcode",
      render: (item) => item.barcode,
    },
    {
      header: "Product Name",
      render: (item) => item.productName,
      cardRole: "title",
    },
    {
      header: "Opening Stock",
      align: "right",
      render: (item) => item.openingStock.toFixed(2),
    },
    {
      header: "Stock In",
      align: "right",
      render: (item) => (
        <div className="bg-amber-100 text-amber-900 rounded px-2 py-1">
          {item.stockIn.toFixed(2)}
        </div>
      ),
    },
    {
      header: "Stock Out",
      align: "right",
      render: (item) => (
        <div
          onClick={() => openProductSales(item.barcode)}
          className="bg-green-100 hover:bg-green-200 text-green-900 rounded px-2 py-1 cursor-pointer"
        >
          {item.stockOut.toFixed(2)}
        </div>
      ),
    },
    {
      header: "Closing Stock",
      align: "right",
      render: (item) => item.closingStock.toFixed(2),
    },
  ];

  return (
    <div className="text-black min-w-0">
      <div className="flex gap-2 items-center mb-4">
        <Layers className="size-8 text-red-900" />
        <h1 className="text-lg sm:text-xl text-red-950 font-bold  shrink-0">
          Day-End Stock Report
        </h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center mb-6 sm:mb-10">
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full sm:w-auto border-2 border-red-900 text-red-900 font-medium rounded p-2"
        />

        <select
          id="outletId"
          value={outlet}
          onChange={(e) => setOutlet(e.target.value)}
          className="w-full sm:w-auto border-2 border-red-900 text-red-900 font-medium rounded p-2"
        >
          {outlets.map((id) => (
            <option key={id} value={id} className="bg-red-50 text-gray-800">
              {id}
            </option>
          ))}
        </select>

        <Button
          onClick={handleFetchStockReport}
          className="w-full sm:w-auto bg-red-700 hover:bg-red-600 text-white px-4 py-2"
        >
          Generate Day-End Stock Report
        </Button>
      </div>
      {/* Loading */}
      {loading && <p>Loading...</p>}
      {/* Table */}
      {!loading && reports.length > 0 && (
        <div id="report-print" className="mx-auto rounded min-w-0">
          <div className="text-gray-800 my-5 font-semibold">
            <h1 className="text-xl sm:text-2xl wrap-break-word">
              Day-End Stock Report of {outlet || "All Outlets"}
            </h1>
            <h4 className="text-gray-800 text-base sm:text-lg">{date}</h4>
            <p className="text-sm text-gray-800">
              Generated at:{" "}
              {new Date().toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          <div className="text-gray-800 mt-6  font-semibold">
            <h1 className="text-base">Stock Items</h1>
          </div>

          <ResponsiveDataView
            data={reports}
            columns={stockReportColumns.map((col) => ({
              ...col,
              headerClassName:
                "bg-gray-200 border border-gray-800 text-gray-900",
              cellClassName: "border border-gray-800",
            }))}
            getRowKey={(_, index) => index}
            tableClassName="w-full text-xs mt-2 border border-gray-300"
            headerRowClassName="text-xs"
            striped={false}
            emptyMessage="No stock report items"
          />
        </div>
      )}

      {/* Product sale modal */}
      <ProductSaleModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        sales={sales}
      />

      {/* No Data */}
      {!loading && reports.length === 0 && (
        <p className="mt-4 text-red-700 font-medium">No data available</p>
      )}

      <div className="flex flex-col-2 gap-2 mt-4 lg:w-fit">
        {/* Print */}
        {reports.length > 0 && (
          <Button
            onClick={printReport}
            className="w-full sm:w-auto print:hidden bg-blue-800 hover:bg-blue-700 text-white px-4 py-2"
          >
            Print Report
          </Button>
        )}

        {/* Download */}
        {reports.length > 0 && (
          <Button
            onClick={saveReportAsPDF}
            className=" w-full sm:w-auto print:hidden bg-green-800 hover:bg-green-700 text-white px-4 py-2"
          >
            Download Report
          </Button>
        )}
      </div>
    </div>
  );
}
