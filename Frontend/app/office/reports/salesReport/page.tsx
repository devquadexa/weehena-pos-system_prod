"use client";

import { useEffect, useState } from "react";
import {
  getCancelledSales,
  getDailyReport,
  getSoldItems,
} from "@/app/services/reportService";
import Button from "@/app/components/Button";
import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";
import { getStock } from "@/app/services/stockService";
import { reportData, SoldItemReport } from "@/app/types/Report";
import { CancelledSaleItem } from "@/app/types/Sale";
import toast from "react-hot-toast";
import { BadgeDollarSign } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export interface CategoryReport {
  items: SoldItemReport[];
  totalValue: number;
  totalQty: number;
}

export interface NonWeightedReport {
  retail: CategoryReport;
  bulk: CategoryReport;
  totalValue: number;
  totalQty: number;
}

export interface SoldItemsReportResponse {
  weighted: CategoryReport;
  nonWeighted: NonWeightedReport;
  grandTotal: number;
}

export default function ReportPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [outlet, setOutlet] = useState("");
  const [outlets, setOutlets] = useState<string[]>([]);
  const [reports, setReports] = useState<reportData[]>([]);
  const [cancelledSales, setCancelledSales] = useState<CancelledSaleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [salesItems, setSalesItems] = useState<SoldItemsReportResponse | null>(
    null,
  );

  const handleFetchDailyReport = async () => {
    try {
      setReports([]);
      setSalesItems(null);
      setLoading(true);
      setCancelledSales([]);

      try {
        const dailyReportData = await getDailyReport(date, outlet);
        console.log("Daily report OK", dailyReportData);
        setReports(dailyReportData);
      } catch (e) {
        console.error("Daily report failed", e);
      }

      try {
        const soldItemsData = await getSoldItems(date, outlet);
        console.log("Sold items OK", soldItemsData);
        setSalesItems(soldItemsData);
      } catch (e) {
        console.error("Sold items failed", e);
      }

      try {
        const cancelledItems = await getCancelledSales(outlet, date);
        console.log("Cancelled sales OK", cancelledItems);
        setCancelledSales(cancelledItems);
      } catch (e) {
        console.error("Cancelled sales failed", e);
      }
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

  // Sales Table
  const salesColumns: ColumnDef<SoldItemReport>[] = [
    {
      header: "Barcode",
      render: (item) => item.barcode,
    },
    {
      header: "Item Name",
      render: (item) => item.itemName,
      cardRole: "title",
    },
    {
      header: "Sale Qty",
      align: "center",
      render: (item) => item.saleQty?.toFixed(2),
    },
    {
      header: "Sale Price",
      align: "right",
      render: (item) => item.salePrice?.toFixed(2),
    },
    {
      header: "Sale Value",
      align: "right",
      render: (item) => item.saleValue?.toFixed(2),
    },
  ];

  // Cancelled Sales Table
  const cancelledSalesColumns: ColumnDef<CancelledSaleItem>[] = [
    {
      header: "Invoice No",
      render: (item) => item.invoiceNo,
    },
    {
      header: "Item Name",
      render: (item) => item.itemName,
      cardRole: "title",
    },
    {
      header: "Sale Qty",
      align: "center",
      render: (item) => item.saleQty.toFixed(2),
    },
    {
      header: "Sale Price",
      align: "right",
      render: (item) => item.salePrice.toFixed(2),
    },
    {
      header: "Sale Value",
      align: "right",
      render: (item) => item.saleValue.toFixed(2),
    },
  ];

  // Print report
  const printReport = () => {
    document.body.classList.add("printing-report");
    document.title = `Daily Sales Report of ${outlet} (${date})`;
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

      // Render the report at a CSS width that maps 1:1 to the PDF's
      // usable width at standard 96 DPI — this is what makes the
      // font size match window.print() instead of looking shrunk.
      const DPI = 130;
      const MM_PER_PX = 25.4 / DPI;
      const REPORT_WIDTH = Math.round(usableWidth / MM_PER_PX);

      const canvas = await html2canvas(report, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: REPORT_WIDTH,
        onclone: (clonedDoc, clonedEl) => {
          clonedDoc.body.classList.add("printing-report");
          clonedEl.style.width = `${REPORT_WIDTH}px`;
          clonedEl.style.maxWidth = `${REPORT_WIDTH}px`;

          // Force desktop table layout regardless of clone viewport width,
          // since html2canvas doesn't respect the `lg:` breakpoint reliably
          // once REPORT_WIDTH is tuned for correct text sizing.
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

      // imgWidth now equals usableWidth "by construction" via REPORT_WIDTH,
      // preserving the same px->mm ratio as REPORT_WIDTH's own 96dpi mapping.
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

      pdf.save(`Daily Sales Report ${outlet} (${date}).pdf`);

      toast.success("Sales Report generated successfully!", { id: "pdf" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: "pdf" });
    }
  };

  return (
    <div className="text-black min-w-0 ">
      <div className="flex gap-2 items-center mb-4">
        <BadgeDollarSign className="size-8 text-red-900" />
        <h1 className="text-lg sm:text-xl text-red-950 font-bold  shrink-0">
          Daily Sales Reports
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
          onClick={handleFetchDailyReport}
          className="w-full sm:w-auto bg-red-700 hover:bg-red-600 text-white px-4 py-2"
        >
          Generate Daily Report
        </Button>
      </div>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Table */}
      {!loading && reports.length > 0 && salesItems && (
        <div id="report-print" className="mx-auto rounded min-w-0">
          <div className="text-gray-800 my-5 font-semibold">
            <h1 className="text-xl sm:text-2xl wrap-break-word">
              Sales Report of {outlet || "All Outlets"}
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

          <h1 className="text-lg font-semibold text-gray-800 mt-6">
            Sales Items
          </h1>
          {salesItems?.weighted?.items?.length > 0 && (
            <div className="relative">
              <h1 className="text-sm font-semibold text-gray-800 mt-4">
                Chicken Products
              </h1>
              <ResponsiveDataView
                data={salesItems.weighted.items}
                columns={salesColumns.map((col) => ({
                  ...col,
                  headerClassName:
                    "bg-gray-200 border border-gray-800 text-gray-950",
                  cellClassName: "border border-gray-800",
                }))}
                getRowKey={(_, index) => index}
                tableClassName="w-full border border-gray-300 text-xs mt-2"
                headerRowClassName="text-xs"
                striped={false}
                emptyMessage="No sales items"
              />
              <div className="absolute right-0 font-semibold text-gray-800 mt-2">
                <p>
                  Total Sales (Rs.) -{" "}
                  {salesItems.weighted.totalValue.toFixed(2)}{" "}
                </p>
              </div>
            </div>
          )}

          {salesItems?.nonWeighted?.retail?.items?.length > 0 && (
            <div className="relative">
              <h1 className="text-sm font-semibold text-gray-800 mt-4">
                Sausage Products
              </h1>
              <ResponsiveDataView
                data={salesItems.nonWeighted.retail.items}
                columns={salesColumns.map((col) => ({
                  ...col,
                  headerClassName:
                    "bg-gray-200 border border-gray-800 text-gray-950",
                  cellClassName: "border border-gray-800",
                }))}
                getRowKey={(_, index) => index}
                tableClassName="w-full border border-gray-300 text-xs mt-2"
                headerRowClassName="text-xs"
                striped={false}
                emptyMessage="No sales items"
              />
              <div className="absolute right-0 font-semibold text-gray-800 mt-2">
                <p>
                  Total Sales (Rs.) -{" "}
                  {salesItems.nonWeighted.retail.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {salesItems?.nonWeighted?.bulk?.items?.length > 0 && (
            <div className="relative">
              <h1 className="text-sm font-semibold text-gray-800 mt-4">
                Sausage products (Bulk)
              </h1>
              <ResponsiveDataView
                data={salesItems.nonWeighted.bulk.items}
                columns={salesColumns.map((col) => ({
                  ...col,
                  headerClassName:
                    "bg-gray-200 border border-gray-800 text-gray-950",
                  cellClassName: "border border-gray-800",
                }))}
                getRowKey={(_, index) => index}
                tableClassName="w-full border border-gray-300 text-xs mt-2"
                headerRowClassName="text-xs"
                striped={false}
                emptyMessage="No sales items"
              />
              <div className="absolute right-0 font-semibold text-gray-800 mt-2">
                <p>
                  Total Sales (Rs.) -{" "}
                  {salesItems.nonWeighted.bulk.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {cancelledSales.length > 0 && (
            <>
              <div className="text-gray-800 mt-6  font-semibold">
                <h1 className="text-base">Cancelled Sales</h1>
              </div>
              <ResponsiveDataView
                data={cancelledSales}
                columns={cancelledSalesColumns.map((col) => ({
                  ...col,
                  headerClassName:
                    "bg-gray-200 border border-gray-800 text-gray-950",
                  cellClassName: "border border-gray-800",
                }))}
                getRowKey={(_, index) => index}
                tableClassName="w-full border border-gray-300 text-xs mt-2"
                headerRowClassName="text-xs"
                striped={false}
                emptyMessage="No cancelled sales"
              />
            </>
          )}

          <div className="text-gray-800 mt-6  font-semibold">
            <h1 className="text-base">Sales Summary</h1>
          </div>

          {reports.map((r, i) => (
            <div
              key={i}
              className="w-full max-w-md px-4 rounded text-gray-900 font-medium mt-2"
            >
              <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
                <span className="text-gray-700 font-semibold">Date :</span>
                <span className="text-gray-900 font-medium text-right">
                  {r.date}
                </span>

                <span className="text-gray-700 font-semibold">Outlet :</span>
                <span className="text-gray-900 font-medium text-right">
                  {r.outletId}
                </span>

                <span className="text-gray-700 font-semibold">
                  Transactions :
                </span>
                <span className="text-gray-900 font-medium text-right">
                  {r.totalTransactions}
                </span>

                <span className="text-gray-700 font-semibold">
                  Total Sale Value (LKR) :
                </span>
                <span className="text-gray-900 font-medium text-right">
                  {salesItems?.grandTotal.toFixed(2)}
                </span>

                <span className="text-gray-700 font-semibold">
                  Discount (LKR) :
                </span>
                <span className="text-gray-900 font-medium text-right">
                  {r.discountAmount?.toFixed(2)}
                </span>

                <span className="text-gray-700 font-semibold">
                  Net Sales (LKR) :
                </span>
                <span className="text-gray-900 font-medium text-right">
                  {r.totalSales.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Data */}
      {!loading && (reports.length === 0 || !salesItems) && (
        <p className="mt-4 text-red-700 font-medium">No data available</p>
      )}

      <div className="flex flex-col-2 gap-2 mt-6 lg:w-fit">
        {/* Print */}
        {reports.length > 0 && salesItems && (
          <Button
            onClick={printReport}
            className="w-full sm:w-auto print:hidden bg-blue-800 hover:bg-blue-700 text-white px-4 py-2"
          >
            Print Report
          </Button>
        )}

        {/* Download */}
        {reports.length > 0 && salesItems && (
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
