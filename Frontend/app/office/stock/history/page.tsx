"use client";

import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";
import { StockHistoryItem } from "@/app/types/Stock";
import { useEffect, useEffectEvent, useState } from "react";

const stockBadge = (value: string | number, color: string) => (
  <div className={`${color} p-1 rounded-lg w-20 mx-auto text-center`}>
    {value}
  </div>
);

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

  const historyColumns: ColumnDef<StockHistoryItem>[] = [
    {
      header: "Barcode",
      render: (h) => h.barcode,
    },
    {
      header: "Product",
      render: (h) => h.productName,
      cardRole: "title",
    },
    {
      header: "Outlet ID",
      render: (h) => h.outletId,
    },
    {
      header: "Previous Stock",
      align: "center",
      render: (h) => stockBadge(h.oldStock, "bg-blue-300"),
    },
    {
      header: "Updated Stock",
      align: "center",
      render: (h) => stockBadge(h.updatedStock, "bg-amber-100"),
    },
    {
      header: "Current Stock",
      align: "center",
      render: (h) => stockBadge(h.newStock, "bg-green-300"),
    },
    {
      header: "User",
      render: (h) => h.changedBy,
    },
    {
      header: "Date",
      render: (h) => h.changedAt,
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0">
      <h1 className="text-lg sm:text-xl text-red-950 font-bold mb-4 shrink-0">
        Stock Update History
      </h1>
      <input
        id="search"
        type="text"
        placeholder="Search by barcode or product name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 font-medium p-2 border h-8 border-gray-300 rounded w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-red-800 text-xs text-gray-700 shrink-0"
      />
      <div className="flex-1 min-h-0">
        <ResponsiveDataView
          data={filteredStockHistory}
          columns={historyColumns}
          getRowKey={(h) => h.id}
          tableClassName="w-full border border-gray-200 text-xs"
          emptyMessage="No history records match your search"
          scrollable
        />
      </div>
    </div>
  );
}
