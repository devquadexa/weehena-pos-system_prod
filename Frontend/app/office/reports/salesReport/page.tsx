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

export default function ReportPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [outlet, setOutlet] = useState("");
  const [outlets, setOutlets] = useState<string[]>([]);
  const [reports, setReports] = useState<reportData[]>([]);
  const [salesItems, setSalesItems] = useState<SoldItemReport[]>([]);
  const [cancelledSales, setCancelledSales] = useState<CancelledSaleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetchDailyReport = async () => {
    try {
      setReports([]);
      setSalesItems([]);
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

  const totalValue = salesItems.reduce(
    (sum, item) => sum + (item.saleValue || 0),
    0,
  );

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

  const cacelledSalesColumns: ColumnDef<CancelledSaleItem>[] = [
    {
      header: "Invoice No",
      render: (item) => item.invoiceNo,
    },
    // {
    //   header: "Barcode",
    //   render: (item) => item.barcode,
    // },
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

  const printReport = () => {
    document.body.classList.add("printing-report");

    const now = new Date();

    const formattedDate = now.toISOString().split("T")[0];

    document.title = `Daily Sales Report of ${outlet} (${formattedDate})`;

    window.print();
    document.body.classList.remove("printing-report");
  };

  return (
    <div className="text-black min-w-0">
      <h1 className="text-lg sm:text-xl text-red-950 font-bold mb-4">
        Daily Reports
      </h1>

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
      {!loading && reports.length > 0 && salesItems.length > 0 && (
        <div id="report-print" className="mx-auto rounded min-w-0">
          <div className="text-gray-800 my-5 font-semibold">
            <h1 className="text-xl sm:text-2xl wrap-break-word">
              Sales Report of {outlet || "All Outlets"}
            </h1>
            <h4 className="text-gray-800 text-base sm:text-lg">{date}</h4>
            <p className="text-sm text-gray-800">
              Generated at: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="text-gray-800 mt-6  font-semibold">
            <h1 className="text-lg">Sales Items</h1>
          </div>

          <ResponsiveDataView
            data={salesItems}
            columns={salesColumns.map((col) => ({
              ...col,
              headerClassName:
                "bg-gray-200 border border-gray-800 text-gray-950",
              cellClassName: "border border-gray-800",
            }))}
            getRowKey={(_, index) => index}
            tableClassName="w-full border border-gray-300 text-sm mt-2"
            headerRowClassName=""
            striped={false}
            emptyMessage="No sales items"
          />

          <div className="text-gray-800 mt-6  font-semibold">
            <h1 className="text-lg">Cancelled Sales</h1>
          </div>

          <ResponsiveDataView
            data={cancelledSales}
            columns={cacelledSalesColumns.map((col) => ({
              ...col,
              headerClassName:
                "bg-gray-200 border border-gray-800 text-gray-950",
              cellClassName: "border border-gray-800",
            }))}
            getRowKey={(_, index) => index}
            tableClassName="w-full border border-gray-300 text-sm mt-2"
            headerRowClassName=""
            striped={false}
            emptyMessage="No cancelled sales"
          />

          <div className="text-gray-800 mt-6  font-semibold">
            <h1 className="text-lg">Sales Summary</h1>
          </div>

          {reports.map((r, i) => (
            <div
              key={i}
              className="w-full max-w-md p-4 rounded text-sm text-gray-900 font-medium mt-4"
            >
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
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
                  {totalValue.toFixed(2)}
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
      {!loading && (reports.length === 0 || salesItems.length === 0) && (
        <p className="mt-4 text-red-700 font-medium">No data available</p>
      )}

      {/* Print */}
      {reports.length > 0 && salesItems.length > 0 && (
        <Button
          onClick={printReport}
          className="mt-4 w-full sm:w-auto print:hidden bg-green-800 hover:bg-green-700 text-white px-4 py-2"
        >
          Print Report
        </Button>
      )}
    </div>
  );
}
