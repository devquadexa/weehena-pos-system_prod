"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Button from "./Button";

interface Props {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (cashReceived: number) => void;
}

export default function PaymentModal({
  isOpen,
  total,
  onClose,
  onConfirm,
}: Props) {
  const [cashReceived, setCashReceived] = useState("");

  //fix hydration error
  const updateCashReceived = useEffectEvent(() => {
    setCashReceived("");
  });

  useEffect(() => {
    if (isOpen) {
      updateCashReceived();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cash = Number(cashReceived) || 0;
  const balance = cash - total;
  const enoughCash = cash >= total;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl text-red-900 font-bold mb-4">Payment</h2>

        <div className="space-y-4">
          <div>
            <label className="font-semibold text-black">Total Amount</label>
            <input
              value={total.toFixed(2)}
              readOnly
              className="w-full text-black  p-2 rounded bg-gray-300"
            />
          </div>

          <div>
            <label className="font-semibold text-black">Cash Received</label>
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              className="w-full text-black border-2 border-red-800  bg-red-50 p-2 rounded"
            />
          </div>

          <div>
            {enoughCash ? (
              <p className="text-green-600 font-bold text-lg">
                Change: Rs. {balance.toFixed(2)}
              </p>
            ) : (
              <p className="text-red-600 font-bold text-lg">
                Remaining: Rs. {(total - cash).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-white"
          >
            Cancel
          </Button>

          <button
            disabled={!enoughCash}
            onClick={async () => {
              onConfirm(cash);
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white disabled:bg-gray-400 rounded px-2 py-1"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
}
