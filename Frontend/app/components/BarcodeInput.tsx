"use client";

import { RefObject, useEffect } from "react";

type BarcodeInputProps = {
  barcode: string;
  setBarcode: (value: string) => void;
  handleAdd: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
};

export default function BarcodeInput({
  barcode,
  setBarcode,
  handleAdd,
  inputRef,
}: BarcodeInputProps) {
  useEffect(() => {
    inputRef.current?.focus();
  },[inputRef] );
  return (
    <input
      id="barcode"
      type="text"
      ref={inputRef}
      value={barcode}
      onChange={(e) => setBarcode(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      placeholder="Scan or enter barcode"
      className="w-72 h-10 p-3 text-gray-700 text-md border-2 bg-red-50 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
    />
  );
}
