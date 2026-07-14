"use client";

import Button from "@/app/components/Button";
import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";
import { StockHistoryItem } from "@/app/types/Stock";
import { History } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";

const stockBadge = (value: string | number, color: string) => (
  <div className={`${color} p-1 rounded-lg w-20 mx-auto text-center`}>
    {value}
  </div>
);

const formatStockHistoryTimestamp = (value: string) => {
  if (!value) return "-";

  const normalized = value.replace("T", " ").split(".")[0].trim();
  const [datePart, timePart] = normalized.split(" ");

  if (!datePart || !timePart) return value;

  const [year, month, day] = datePart.split("-");
  const [hour, minute, second = "00"] = timePart.split(":");

  if (!year || !month || !day || !hour || !minute) return value;

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<StockHistoryItem[]>([]);

  const [search, setSearch] = useState("");

  const [outletId, setOutletId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [outlets, setOutlets] = useState<string[]>([]);

  const loadHistory = async () => {
      const res = await fetch("https://weehenapos360.cloud/api/stock/history");
    // const res = await fetch("http://localhost:8080/api/stock/history");
    const data = await res.json();
    const historyData = Array.isArray(data) ? data : [];

    setHistory(historyData);

    // Extract unique outlet IDs
    const uniqueOutlets = [
      ...new Set(historyData.map((item) => item.outletId)),
    ];

    setOutlets(uniqueOutlets);

    // Select first outlet by default
    if (uniqueOutlets.length > 0 && !outletId) {
      setOutletId(uniqueOutlets[0]);
    }
  };

  const updateLoadHistory = useEffectEvent(() => {
    loadHistory();
  });

  useEffect(() => {
    updateLoadHistory();
  }, []);

  const handleSearchHistory = async () => {
    if (!startDate || !endDate) {
      loadHistory();
      return;
    }
    const res = await fetch(
      `https://weehenapos360.cloud/api/stock/history/period?outletId=${outletId}&startDate=${startDate}&endDate=${endDate}`,
    );
    // const res = await fetch(
    //    `http://localhost:8080/api/stock/history/period?outletId=${outletId}&startDate=${startDate}&endDate=${endDate}`,
    // );

    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
  };

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
      header: "Changed By",
      render: (h) => h.changedBy,
    },
    {
      header: "Changed At",
      render: (h) => formatStockHistoryTimestamp(h.changedAt),
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0">
      <div className="flex gap-2 items-center mb-4">
        <History className="size-8 text-red-900" />
        <h1 className="text-lg sm:text-xl text-red-950 font-bold  shrink-0">
          Stock Update History
        </h1>
      </div>
      <input
        id="search"
        type="text"
        placeholder="Search by barcode or product name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 font-medium p-2 border h-8 border-gray-300 rounded w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-red-800 text-xs text-gray-700 shrink-0"
      />

      <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4 mb-6 sm:mb-10">
        {/* Start Date */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="startDate"
            className="text-sm font-semibold text-gray-700"
          >
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-2 border-red-900 text-red-900 font-medium rounded-md px-3 py-2"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="endDate"
            className="text-sm font-semibold text-gray-700"
          >
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-2 border-red-900 text-red-900 font-medium rounded-md px-3 py-2"
          />
        </div>

        {/* Outlet */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="outletId"
            className="text-sm font-semibold text-gray-700"
          >
            Outlet
          </label>
          <select
            id="outletId"
            value={outletId}
            onChange={(e) => setOutletId(e.target.value)}
            className="border-2 border-red-900 text-red-900 font-medium rounded-md px-3 py-2 min-w-45"
          >
            {outlets.map((id) => (
              <option key={id} value={id} className="bg-white text-gray-800">
                {id}
              </option>
            ))}
          </select>
        </div>

        {/* Button */}
        <div className="flex items-end">
          <Button
            onClick={handleSearchHistory}
            className="w-full sm:w-auto font-medium bg-red-700 hover:bg-red-600 text-white px-6 py-2 h-10.5"
          >
            Get Stock History
          </Button>
        </div>
      </div>
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
