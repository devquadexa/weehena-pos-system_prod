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
    } catch (err) {
      console.error("Failed to delete stock:", err);
      alert("Failed to delete stock");
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
        alert("User not logged in");
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
      alert("Failed to update stock");
    }
  };
  const handleConfirmValueforWeight = async (value: number) => {
    if (!selectedStock) return;

    try {
      const user = getUserFromToken();

      if (!user || !user.role) {
        alert("User not logged in");
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
      alert("Failed to update stock");
    }
  };

  return (
    <div className="relative text-xs">
      <h1 className="text-xl text-red-950 font-bold mb-4">Stock Management</h1>

      <div className="">
        {/* Search */}
        <input
          id="search"
          placeholder="Search by barcode, product name or outlet ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border w-74  border-gray-300 text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
        />
        <Button
          onClick={() => setFormOpen(true)}
          className="absolute right-0 bg-green-900 hover:bg-green-700 text-white px-4 rounded"
        >
          Add Stock
        </Button>
      </div>

      {/* Add Stock */}
      <div className="rounded mb-6 flex gap-2 flex-wrap">
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

      {/* Stock Table */}
      <table className="w-full border border-gray-300 text-xs">
        <thead>
          <tr className="bg-red-50">
            <th className="text-left text-red-900 w-40 p-2">
              Barcode
            </th>
            <th className="text-left text-red-900 w-90 p-2">Product</th>
            <th className="text-center text-red-900 w-30 p-2">Quantity</th>
            <th className="text-center text-red-900 w-30 p-2 mx-auto">
              Weight
            </th>
            <th className="text-center text-red-900 p-2 w-30">Outlet</th>
            <th className="text-center text-red-900 w-30 p-2 mx-auto">
              Low Stock Threshold Qty
            </th>
            <th className="text-center text-red-900 w-40 p-2 mx-auto">
              Low Stock Threshold Weight
            </th>

            <th className="text-center text-red-900 w-20 p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredStock.map((item) => (
            <tr
              key={item.id}
              className={`${item.weight < item.lowStockThresholdWeight ? "bg-red-300" : ""} ${item.quantity < item.lowStockThresholdQty ? "bg-red-300" : ""} border border-gray-300`}
            >
              <td className="text-left text-gray-800 font-medium p-2 w-40">
                {item.barcode}
              </td>
              <td className=" text-gray-800 font-medium p-2 w-90">
                {item.productName}
              </td>

              {/* Editable Quantity */}
              <td className="border-gray-800 p-2 w-30">
                <div
                  onClick={() => {
                    if (!item.weighted) {
                      handleQtyClick(item);
                    }
                  }}
                  className={`text-center px-3 py-1 rounded font-semibold ${
                    item.weighted
                      ? " text-gray-800 cursor-not-allowed"
                      : "bg-blue-200 hover:bg-blue-100 cursor-pointer text-blue-900"
                  }`}
                >
                  {item.quantity ? item.quantity : "N/A"}
                </div>
              </td>
              <td className="p-2 w-30">
                <div
                  onClick={() => {
                    if (item.weighted) {
                      handleWeightClick(item);
                    }
                  }}
                  className={`text-center px-3 py-1 rounded font-semibold ${
                    item.weighted
                      ? "bg-blue-200 hover:bg-blue-100 cursor-pointer text-blue-900"
                      : " text-gray-800 cursor-not-allowed"
                  }`}
                >
                  {item.weight ? item.weight.toFixed(2) : "N/A"}
                </div>
              </td>

              <td className="  text-center text-gray-800 font-medium p-2 w-30">
                {item.outletId}
              </td>
              <td className="  text-center text-gray-800 font-medium p-2 w-40">
                {item.lowStockThresholdQty ? item.lowStockThresholdQty : "N/A"}
              </td>
              <td className="  text-center text-gray-800 font-medium  p-2 w-40">
                {item.lowStockThresholdWeight
                  ? item.lowStockThresholdWeight.toFixed(2)
                  : "N/A"}
              </td>

              <td className="w-20 p-2">
                <Button
                  onClick={() => handleDelete(item.id)}
                  className=" bg-red-800 text-white mx-auto  rounded hover:bg-red-700"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
