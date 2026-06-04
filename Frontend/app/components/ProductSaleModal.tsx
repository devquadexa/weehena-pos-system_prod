"use client";

import { ProductSaleData } from "../types/Sale";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sales: ProductSaleData[];
}

export default function ProductSalesModal({ isOpen, onClose, sales }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center gap-3 mb-4">
          <h2 className="text-lg sm:text-2xl font-bold text-black">
            Product Sales
          </h2>

          <button
            onClick={onClose}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Close
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sales.map((sale, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 shadow-sm bg-gray-50 hover:shadow-md transition"
            >
              {/* Top */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-black">
                  {sale.invoiceNo}
                </h3>

                <span
                  className={`px-2 py-1 rounded text-sm font-semibold
                  ${
                    sale.saleStatus === "CANCELLED"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {sale.saleStatus}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-2 text-black">
                <p>
                  <span className="font-semibold">Product Name:</span> {sale.productName}
                </p>

                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(sale.saleDate).toLocaleString()}
                </p>

                <p>
                  <span className="font-semibold">Qty:</span> {sale.saleQty}
                </p>

                <p>
                  <span className="font-semibold">Price:</span> LKR{" "}
                  {sale.salePrice}
                </p>

                <p className="text-lg font-bold">Total: LKR {sale.saleValue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
