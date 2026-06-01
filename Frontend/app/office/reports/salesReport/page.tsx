"use client";

import { useEffect, useState } from "react";
import { getDailyReport, getSoldItems } from "@/app/services/reportService";
import Button from "@/app/components/Button";
import { getStock } from "@/app/services/stockService";
import { reportData, SoldItemReport } from "@/app/types/Report";

export default function ReportPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [outlet, setOutlet] = useState("");
  const [outlets, setOutlets] = useState<string[]>([]);
  const [reports, setReports] = useState<reportData[]>([]);
  const [salesItems, setSalesItems] = useState<SoldItemReport[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetchDailyReport = async () => {
    try {
      setReports([]);
      setSalesItems([]);
      setLoading(true);
      const dailyReportData = await getDailyReport(date, outlet);
      const soldItemsData = await getSoldItems(date, outlet);
      setReports(dailyReportData);
      setSalesItems(soldItemsData);
      console.log("Report data:", dailyReportData);
      console.log("Sales data:", soldItemsData);
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

  const totalValue = salesItems.reduce(
    (sum, item) => sum + (item.saleValue || 0),
    0,
  );

  const printReport = () => {
    document.body.classList.add("printing-report");

    const now = new Date();

    const formattedDate = now.toISOString().split("T")[0];

    document.title = `Daily Sales Report of ${outlet} (${formattedDate})`;

    window.print();
    document.body.classList.remove("printing-report");
  };

  return (
    <div className="text-black ">
      <h1 className="text-xl text-red-950 font-bold mb-4">Daily Reports</h1>

      {/* Controls */}
      <div className="flex gap-2 mb-10">
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border-2 border-red-900 text-red-900 font-medium rounded p-2 "
        />

        <select
          id="outletId"
          value={outlet}
          onChange={(e) => setOutlet(e.target.value)}
          className="border-2 border-red-900 text-red-900 font-medium rounded p-2 "
        >
          {outlets.map((id) => (
            <option key={id} value={id} className="bg-red-50 text-gray-800">
              {id}
            </option>
          ))}
        </select>

        <Button
          onClick={handleFetchDailyReport}
          className="bg-red-700 hover:bg-red-600 text-white px-4 py-2"
        >
          Generate Daily Report
        </Button>
      </div>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Table */}
      {!loading && reports.length > 0 && salesItems.length > 0 && (
        <div id="report-print" className="mx-auto rounded">
          <div className="text-gray-800 my-5 font-semibold">
            <h1 className="text-2xl">
              Sales Report of {outlet || "All Outlets"}
            </h1>
            <h4 className="text-gray-800 text-lg">{date}</h4>
            <p className="text-sm text-gray-800">
              Generated at: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="text-gray-800 mt-6  font-semibold">
            <h1 className="text-lg">Sales Items</h1>
          </div>

          <table className="w-full border border-gray-300 text-sm  mt-2 print:w-full">
            <thead>
              <tr>
                <th className="bg-gray-200 border border-gray-800 text-left text-gray-950 w-40 p-2">
                  Barcode
                </th>
                <th className="bg-gray-200 border border-gray-800 text-left text-gray-950 w-50 p-2">
                  Item Name
                </th>
                <th className="bg-gray-200 border border-gray-800 text-center text-gray-950 w-30 p-2">
                  Qty
                </th>
                <th className="bg-gray-200 border border-gray-800 text-right text-gray-950 w-30 p-2">
                  Sale Price
                </th>
                <th className="bg-gray-200 border border-gray-800 text-right text-gray-950 w-30 p-2">
                  Sale Value
                </th>
              </tr>
            </thead>
            <tbody>
              {salesItems.map((item, index) => (
                <tr key={index}>
                  <td className="border text-left border-gray-800 text-gray-900 font-medium w-40 p-2">
                    {item.barcode}
                  </td>
                  <td className="border text-left border-gray-800 text-gray-900 font-medium w-50 p-2">
                    {item.itemName}
                  </td>
                  <td className="border text-center border-gray-800 text-gray-900 font-medium w-30 p-2">
                    {item.saleQty?.toFixed(2)}
                  </td>
                  <td className="border text-right border-gray-800 text-gray-900 font-medium w-30 p-2">
                    {item.salePrice?.toFixed(2)}
                  </td>
                  <td className="border text-right border-gray-800 text-gray-900 font-medium w-30 p-2">
                    {item.saleValue?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-gray-800 mt-6  font-semibold">
            <h1 className="text-lg">Sales Summary</h1>
          </div>

          {reports.map((r, i) => (
            <div
              key={i}
              className="w-fit p-4 rounded text-sm text-gray-900 font-medium mt-4"
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
          className="mt-4 print:hidden bg-green-800 hover:bg-green-700 text-white px-4 py-2"
        >
          Print Report
        </Button>
      )}
    </div>
  );
}
