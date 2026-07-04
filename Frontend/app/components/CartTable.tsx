"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { CartItem } from "../types";
import { X } from "lucide-react";

interface Props {
  cart: CartItem[];
  onDelete: (barcode: string) => void;
}

export default function CartTable({ cart, onDelete }: Props) {
  const [isClient, setIsClient] = useState(false);

  const updateIsClient = useEffectEvent((isClient: boolean) => {
    setIsClient(isClient);
  });

  useEffect(() => {
    updateIsClient(true);
  }, []);

  return (
    isClient && (
      <table className=" w-full  mt-5 border-collapse  border border-gray-300 shadow-lg">
        <thead className="bg-red-900">
          <tr>
            <th className="border text-sm font-medium border-gray-400 p-2 w-50">
              Barcode
            </th>
            <th className="border text-sm font-medium border-gray-400 p-2 w-100">
              Item Name
            </th>
            <th className="border text-sm font-medium border-gray-400 p-2 w-40">
              Qty
            </th>
            <th className="border text-sm font-medium border-gray-400 p-2 w-40">
              Price (Rs.)
            </th>
            <th className="border text-sm font-medium border-gray-400 p-2 w-40">
              Total (Rs.)
            </th>
            <th className="border font-medium border-gray-400 p-2 w-40">
              Remove
            </th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, idx) => (
            <tr key={idx}>
              <td className="border text-sm font-semibold text-gray-800 border-gray-400 p-2">
                {item.barcode}
              </td>
              <td className="border text-sm font-semibold text-gray-800 border-gray-400 p-2">
                {item.name}
              </td>
              <td className="border text-sm font-semibold text-blue-700  border-gray-400 p-2 text-center">
                {item.weighted
                  ? `${item.value.toFixed(2)} kg`
                  : `${item.value} PCs`}
              </td>
              <td className="border text-sm font-semibold text-gray-800 border-gray-400 p-2 text-right">
                {item.weighted
                  ? item.retailPrice.toFixed(2)
                  : item.retailPrice.toFixed(2)}
              </td>
              <td className="border text-sm font-semibold text-blue-700 border-gray-400 p-2 text-right">
                {item.weighted
                  ? (item.retailPrice * item.value).toFixed(2)
                  : (item.retailPrice * item.value).toFixed(2)}
              </td>
              <td className="border text-sm text-gray-700 border-gray-400 p-2 text-center">
                <button
                  onClick={() => onDelete(item.barcode)}
                  className=" text-red-900 bg-red-200 px-5 py-2 rounded hover:bg-red-300"
                >
                  <X className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );
}
