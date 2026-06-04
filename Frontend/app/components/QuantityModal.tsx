"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Button from "./Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (qty: number) => void;
  initialQty: number | null;
  productName: string;
  heading: string;
}

export default function QuantityModal({
  isOpen,
  onClose,
  onConfirm,
  initialQty,
  productName,
  heading,
}: Props) {
  const [qty, setQty] = useState<number | null>(initialQty);
  const [isClient, setIsClient] = useState(false);

  // hydration fix: only render on client side
  const updateIsClient = useEffectEvent((isClient: boolean) => {
    setIsClient(isClient);
  });

  useEffect(() => {
    updateIsClient(true);
  }, []);

  const updateQty = useEffectEvent((initialQty: number | null) => {
    setQty(initialQty);
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Reset qty when modal opens
  useEffect(() => {
    if (isOpen) updateQty(initialQty);

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [isOpen, initialQty]);

  if (!isOpen) return null;

  return (
    isClient && (
      <div
        className="fixed inset-0 z-50 rounded-2xl bg-black/50 backdrop-blur-sm items-center justify-center w-full flex mx-auto transition-all duration-200 font-poppins"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg w-80 mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-black text-xl font-bold mb-4">{heading}</h2>

          <p className="mb-2 text-gray-900">{productName}</p>

          <input
            ref={inputRef}
            id="quantity"
            type="number"
            value={qty !== null ? qty : ""}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setQty(isNaN(value) ? 0 : value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!qty || qty <= 0) return;
                onConfirm(qty);
                onClose();
              }

              if (e.key === "Escape") {
                onClose();
              }
            }}
            autoFocus
            className="w-full p-2 border rounded mb-4 text-gray-900"
          />

          <div className="flex justify-center gap-2">
            <Button
              onClick={onClose}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
            >
              Cancel
            </Button>

            <Button
              onClick={() => {
                if (!qty || qty <= 0) return;
                onConfirm(qty);
                onClose();
              }}
              className="px-4 py-2 hover:bg-blue-600 bg-blue-500 text-white rounded"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    )
  );
}
