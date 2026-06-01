"use client";

import { StockHistoryItem } from "@/app/types/Stock";
import { useEffect, useEffectEvent, useState } from "react";

export default function HistoryPage() {
  const [history, setHistory] = useState<StockHistoryItem[]>([]);

  const [search, setSearch] = useState("");

  const loadHistory = async () => {
    const res = await fetch("http://localhost:8080/api/stock/history");
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
  };

  const updateLoadHistory = useEffectEvent(() => {
    loadHistory();
  });

  useEffect(() => {
    updateLoadHistory();
  }, []);

  const filteredStockHistory = history.filter(
    (item) =>
      item.barcode?.toString().includes(search) ||
      item.productName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="">
      <h1 className="text-xl text-red-950 font-bold mb-4">
        Stock Update History
      </h1>
      <input
        id="search"
        type="text"
        placeholder="Search by barcode or product name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 font-medium p-2 border h-8 border-gray-300 rounded w-60 focus:outline-none focus:ring-2 focus:ring-red-800 text-xs text-gray-700"
      />
      <table className="w-full border border-gray-200 text-xs">
        <thead>
          <tr>
            <th className="border-gray-800 text-left text-red-900 w-30 p-2">
              Barcode
            </th>
            <th className="border-gray-800 text-left text-red-900 w-60 p-2">
              Product
            </th>
            <th className="border-gray-800 text-left text-red-900 w-30 p-2">
              Outlet ID
            </th>
            <th className="border-gray-800 text-center text-red-900 w-30 p-2">
              Previous Stock
            </th>
            <th className="border-gray-800 text-center text-red-900 w-30 p-2">
              Updated Stock
            </th>
            <th className="border-gray-800 text-center text-red-900 w-30 p-2">
              Current Stock
            </th>
            <th className="border-gray-800 text-left text-red-900 w-20 p-2">
              User
            </th>
            <th className="border-gray-800 text-left text-red-900 w-40 p-2">
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredStockHistory.map((h: StockHistoryItem) => (
            <tr key={h.id} className="odd:bg-gray-100 even:bg-white">
              <td className="text-left border-gray-800 text-gray-900 font-medium p-2">
                {h.barcode}
              </td>
              <td className="text-left border-gray-800 text-gray-900 font-medium p-2">
                {h.productName}
              </td>
              <td className="text-left border-gray-800 text-gray-900 font-medium p-2">
                {h.outletId}
              </td>
              <td className="text-center border-gray-800 text-gray-900 font-medium p-2">
                <div className="bg-blue-300 p-1 rounded-lg w-20 mx-auto">
                  {h.oldStock}
                </div>
              </td>
              <td className="text-center border-gray-800 text-gray-900 font-medium p-2">
                <div className="bg-amber-100 p-1 rounded-lg w-20 mx-auto">
                  {h.updatedStock}
                </div>
              </td>
              <td className="text-center border-gray-800 text-gray-900 font-medium p-2">
                <div className="bg-green-300 p-1 rounded-lg w-20 mx-auto">
                  {h.newStock}
                </div>
              </td>
              <td className="text-left border-gray-800 text-gray-900 font-medium p-2">
                {h.changedBy}
              </td>
              <td className="text-left border-gray-800 text-gray-900 font-medium p-2">
                {h.changedAt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
