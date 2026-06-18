"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  getStock,
  updateStock,
  deleteStock,
} from "@/app/services/stockService";
import QuantityModal from "@/app/components/QuantityModal";
import Button from "@/app/components/Button";
import WeightModal from "@/app/components/WeightModal";
import StockForm from "@/app/components/StockForm";
import { getUserFromToken } from "@/app/services/userService";
import { StockItem } from "@/app/types/Stock";
import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function StockPage() {
  const [stockList, setStockList] = useState<StockItem[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load stock from backend
  const loadStock = async () => {
    try {
      const data = await getStock();
      //SORT BY BARCODE (ASCENDING)
      const sortedData = data.sort((a: StockItem, b: StockItem) =>
        a.barcode.toString().localeCompare(b.barcode.toString()),
      );

      setStockList(sortedData);
    } catch (err) {
      console.error("Failed to fetch stock:", err);
    }
  };

  const updateLoadStock = useEffectEvent(() => {
    loadStock();
  });

  useEffect(() => {
    updateLoadStock();
  }, []);

  // Quantity Modal opens when click on update stock quantity
  const handleQtyClick = (item: StockItem) => {
    setSelectedStock(item);
    setModalOpen(true);
  };

  // Weight Modal opens when click on update Stock weight
  const handleWeightClick = (item: StockItem) => {
    setSelectedStock(item);
    setWeightModalOpen(true);
  };

  // Delete stock
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure to delete this stock?");
    if (!confirmDelete) return;

    try {
      await deleteStock(id);
      await loadStock();
      toast.success("Stock deleted successfully");
    } catch (err) {
      console.error("Failed to delete stock:", err);
      toast.error("Failed to delete stock");
    }
  };

  const filteredStock = stockList.filter(
    (item) =>
      item.barcode?.toString().includes(search) ||
      item.productName?.toLowerCase().includes(search.toLowerCase()) ||
      item.outletId?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConfirmValueForQty = async (value: number) => {
    if (!selectedStock) return;

    try {
      const user = getUserFromToken();

      if (!user || !user.role) {
        toast.error("User not logged in");
        return;
      }

      await updateStock(selectedStock.id, {
        value: value,
        user: user.role,
      });

      setModalOpen(false);
      setSelectedStock(null);
      await loadStock();
    } catch (err) {
      console.error("Failed to update stock:", err);
      toast.error("Failed to update stock");
    }
  };
  const stockRowClass = (item: StockItem) =>
    item.weight < item.lowStockThresholdWeight ||
    item.quantity < item.lowStockThresholdQty
      ? "bg-red-300"
      : "";

  const stockColumns: ColumnDef<StockItem>[] = [
    {
      header: "Barcode",
      render: (item) => item.barcode,
    },
    {
      header: "Product",
      render: (item) => item.productName,
      cardRole: "title",
    },
    {
      header: "Quantity",
      align: "center",
      render: (item) => (
        <div
          onClick={() => {
            if (!item.weighted) handleQtyClick(item);
          }}
          className={`text-center px-3 py-1 rounded font-semibold ${
            item.weighted
              ? "text-gray-800 cursor-not-allowed"
              : "bg-blue-200 hover:bg-blue-100 cursor-pointer text-blue-900"
          }`}
        >
          {item.quantity ? item.quantity : "N/A"}
        </div>
      ),
    },
    {
      header: "Weight",
      align: "center",
      render: (item) => (
        <div
          onClick={() => {
            if (item.weighted) handleWeightClick(item);
          }}
          className={`text-center px-3 py-1 rounded font-semibold ${
            item.weighted
              ? "bg-blue-200 hover:bg-blue-100 cursor-pointer text-blue-900"
              : "text-gray-800 cursor-not-allowed"
          }`}
        >
          {item.weight ? item.weight.toFixed(2) : "N/A"}
        </div>
      ),
    },
    {
      header: "Outlet",
      align: "center",
      render: (item) => item.outletId,
    },
    {
      header: "Low Stock Threshold Qty",
      align: "center",
      render: (item) =>
        item.lowStockThresholdQty ? item.lowStockThresholdQty : "N/A",
    },
    {
      header: "Low Stock Threshold Weight",
      align: "center",
      render: (item) =>
        item.lowStockThresholdWeight
          ? item.lowStockThresholdWeight.toFixed(2)
          : "N/A",
    },
    {
      header: "Action",
      align: "center",
      cardRole: "actions",
      render: (item) => (
        <button
          onClick={() => handleDelete(item.id)}
          className="w-full lg:w-fit rounded text-red-800 hover:text-red-600 hover:bg-red-100 px-2 py-1 "
        >
          <Trash2 className="size-4 items-center mx-auto" />
        </button>
      ),
    },
  ];

  const handleConfirmValueforWeight = async (value: number) => {
    if (!selectedStock) return;

    try {
      const user = getUserFromToken();

      if (!user || !user.role) {
        toast.error("User not logged in");
        return;
      }

      await updateStock(selectedStock.id, {
        value: value,
        user: user.role,
      });

      setWeightModalOpen(false);
      setSelectedStock(null);
      await loadStock();
    } catch (err) {
      console.error("Failed to update stock:", err);
      toast.error("Failed to update stock");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 text-xs">
      <h1 className="text-lg sm:text-xl text-red-950 font-bold mb-4 shrink-0">
        Stock Management
      </h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 shrink-0">
        <input
          id="search"
          placeholder="Search by barcode, product name or outlet ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border w-full sm:max-w-md border-gray-300 text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
        />
        <Button
          onClick={() => setFormOpen(true)}
          className="w-full sm:w-auto shrink-0 bg-green-900 hover:bg-green-700 text-white px-4 rounded"
        >
          Add Stock
        </Button>
      </div>

      <div className="rounded mb-6 flex gap-2 flex-wrap shrink-0">
        <StockForm
          onClose={() => {
            setFormOpen(false);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
          }}
          onAddSuccess={() => loadStock()}
          isOpen={formOpen}
          heading="Add New Stock"
        />
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveDataView
          data={filteredStock}
          columns={stockColumns}
          getRowKey={(item) => item.id}
          getRowClassName={stockRowClass}
          emptyMessage="No stock items match your search"
          scrollable
          hideHeader={modalOpen || weightModalOpen}
        />
      </div>
      {selectedStock ? (
        selectedStock.weighted ? (
          <WeightModal
            isOpen={weightModalOpen}
            onClose={() => {
              setWeightModalOpen(false);
              setSelectedStock(null);
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
            onConfirm={handleConfirmValueforWeight}
            initialWeight={null}
            productName={selectedStock ? selectedStock.productName : ""}
            heading="Update Stock Weight (Kg)"
          />
        ) : (
          <QuantityModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedStock(null);
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
            onConfirm={handleConfirmValueForQty}
            initialQty={null}
            productName={selectedStock ? selectedStock.productName : ""}
            heading="Update Stock Quantity"
          />
        )
      ) : (
        ""
      )}
    </div>
  );
}
