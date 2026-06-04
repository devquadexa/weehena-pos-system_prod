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
      alert("Failed to load report");
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

    const now = new Date();

    const formattedDate = now.toISOString().split("T")[0];

    document.title = `Day-End Stock Report of ${outlet} (${formattedDate})`;

    window.print();
    document.body.classList.remove("printing-report");
  };

  const openProductSales = async (barcode: string) => {
    const res = await fetch(
      `http://localhost:8080/api/reports/product-sales?barcode=${barcode}&outletId=${outlet}&date=${date}`,
    );

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
      <h1 className="text-lg sm:text-xl text-red-950 font-bold mb-4">
        Day-End Stock Report
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
              Generated at: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="text-gray-800 mt-6  font-semibold">
            <h1 className="text-lg">Stock Items</h1>
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
            tableClassName="w-full text-sm mt-2 border border-gray-300"
            headerRowClassName=""
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
      {/* Print */}
      {reports.length > 0 && (
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
