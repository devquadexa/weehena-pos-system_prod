"use client";

import { useState, useEffect, useEffectEvent, useRef } from "react";
import Button from "./Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (discount: number, type: "percentage" | "fixed") => void;
}

export default function DiscountModal({ isOpen, onClose, onApply }: Props) {
  const [discount, setDiscount] = useState<string>("0");
  const [type, setType] = useState<"percentage" | "fixed">("fixed");

  const updateDiscount = useEffectEvent((discount: string) => {
    setDiscount(discount);
  });

  const updateType = useEffectEvent((type: "fixed"| "percentage" ) => {
    setType(type);
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when open
  useEffect(() => {
    if (isOpen) {
      updateDiscount("0");
      updateType("fixed");
    }

    // focus input
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    const value = parseFloat(discount);
    if (isNaN(value) || value < 0) return;

    onApply(value, type);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 text-black bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Apply Discount</h2>

        <div className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            id="discount"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApply();
            }}
            autoFocus
            className="w-full p-2 border rounded"
            placeholder="Enter discount"
          />

          <select
            id="discountType"
            value={type}
            onChange={(e) => setType(e.target.value as "fixed" | "percentage")}
            className="p-2 border rounded"
          >
            <option value="percentage">%</option>
            <option value="fixed">Rs</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 rounded"
          >
            Cancel
          </Button>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-yellow-500 hover:bg-amber-400 text-white rounded"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
