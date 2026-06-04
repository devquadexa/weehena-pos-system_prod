"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Button from "./Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (weight: number) => void;
  initialWeight: number | null;
  productName: string;
  heading: string;
}

export default function WeightModal({
  isOpen,
  onClose,
  onConfirm,
  initialWeight,
  productName,
  heading,
}: Props) {
  const [weight, setWeight] = useState<number | null>(initialWeight);
  const [isClient, setIsClient] = useState(false);

  // hydration fix
  const updateIsClient = useEffectEvent((val: boolean) => {
    setIsClient(val);
  });

  useEffect(() => {
    updateIsClient(true);
  }, []);

  const updateWeight = useEffectEvent((val: number | null) => {
    setWeight(val);
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // reset when modal opens
  useEffect(() => {
    if (isOpen) updateWeight(initialWeight);

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [isOpen, initialWeight]);

  if (!isOpen) return null;

  return (
    isClient && (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg w-80"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-black text-xl font-bold mb-4">{heading}</h2>

          <p className="mb-2 text-gray-900">{productName}</p>

          <input
            ref={inputRef}
            id="weight"
            type="number"
            step="0.1"
            min="1"
            value={weight !== null ? weight : ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setWeight(isNaN(val) ? 0 : val);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (weight === null || weight <= 0) return;
                onConfirm(weight);
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
                if (weight === null || weight <= 0) return;
                onConfirm(weight);
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
