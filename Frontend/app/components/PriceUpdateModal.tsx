"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Button from "./Button";
import { priceUpdateSchema } from "../schemas/priceUpdateSchema";

export interface PriceForm {
  bulkPrice: number;
  retailPrice: number;
  packPrice: number;
  pricePerKg: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (prices: PriceForm) => void;
  productName: string;
  heading: string;
  weighted: boolean;
  initialValues: PriceForm;
}

export default function PriceUpdateModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  heading,
  weighted,
  initialValues,
}: Props) {
  const [prices, setPrices] = useState<PriceForm>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updatePrices = useEffectEvent((data: PriceForm) => {
    setPrices(data);
  });

  const validateForm = () => {
    const result = priceUpdateSchema.safeParse(prices);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  useEffect(() => {
    if (isOpen) {
      updatePrices(initialValues);
    }
  }, [isOpen, initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPrices((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : parseFloat(value),
    }));

    //Clear Errors While Typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!validateForm()) return;
      onConfirm(prices);
      onClose();
    }

    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white px-6 py-4 rounded-lg shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-red-950 mb-4">{heading}</h2>

        <p className="text-gray-700 font-semibold text-sm mb-4">
          {productName}
        </p>

        <div className="flex flex-col gap-3">
          {/* Bulk Price */}
          <div>
            <label
              htmlFor="bulkPrice"
              className="block text-sm font-medium text-red-950 mb-1"
            >
              Bulk Price (LKR)
            </label>
            <input
              id="bulkPrice"
              name="bulkPrice"
              type="number"
              step="0.01"
              min={1}
              value={prices.bulkPrice}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-red-50 p-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
            />
            {errors.bulkPrice && (
              <p className="text-red-500 font-medium text-xs mt-1">
                {errors.bulkPrice}
              </p>
            )}
          </div>

          {/* Retail Price */}
          <div>
            <label
              htmlFor="retailPrice"
              className="block text-sm font-medium text-red-950 mb-1"
            >
              Retail Price (LKR)
            </label>
            <input
              id="retailPrice"
              name="retailPrice"
              type="number"
              step="0.01"
              min={1}
              value={prices.retailPrice}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-red-50 p-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
            />
            {errors.retailPrice && (
              <p className="text-red-500 font-medium text-xs mt-1">
                {errors.retailPrice}
              </p>
            )}
          </div>

          {/* Non-weighted products */}
          {!weighted && (
            <div>
              <label
                htmlFor="packPrice"
                className="block text-sm font-medium text-red-950 mb-1"
              >
                Pack Price (LKR)
              </label>
              <input
                id="packPrice"
                name="packPrice"
                type="number"
                step="0.01"
                min={1}
                value={prices.packPrice}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-red-50 p-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
              />
              {errors.packPrice && (
                <p className="text-red-500 font-medium text-xs mt-1">
                  {errors.packPrice}
                </p>
              )}
            </div>
          )}

          {/* Weighted products */}
          {weighted && (
            <div>
              <label
                htmlFor="pricePerKg"
                className="block text-sm font-medium text-red-950 mb-1"
              >
                Price Per Kg (LKR)
              </label>
              <input
                id="pricePerKg"
                name="pricePerKg"
                type="number"
                step="0.01"
                min={1}
                value={prices.pricePerKg}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-red-50 p-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
              />
              {errors.pricePerKg && (
                <p className="text-red-500 font-medium text-xs mt-1">
                  {errors.pricePerKg}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <Button
            onClick={() => {
              if (!validateForm()) return;
              onConfirm(prices);
              onClose();
            }}
            className="w-1/2 bg-green-700 hover:bg-green-600 rounded"
          >
            Update
          </Button>

          <Button
            onClick={onClose}
            className="w-1/2 bg-red-500 hover:bg-red-600 rounded"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
