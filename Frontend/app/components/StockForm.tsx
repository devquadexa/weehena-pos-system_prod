"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Form from "next/form";
import Button from "./Button";
import { addStock } from "../services/stockService";
import { fetchProduct } from "../services/productService";
import { getUserFromToken } from "../services/userService";
import { StockRequest } from "../types/Stock";
import { stockSchema } from "../schemas/stockSchema";

type StockFormErrors = {
  barcode: string;
  lowStockThresholdQty: string;
  lowStockThresholdWeight: string;
  outletId: string;
  quantity: string;
  weight: string;
};

export default function ProductForm({
  isOpen,
  onClose,
  onAddSuccess,
  heading,
}: {
  onAddSuccess?: () => void;
  isOpen: boolean;
  onClose: () => void;
  heading: string;
}) {
  const [formData, setFormData] = useState<StockRequest>({
    barcode: "",
    lowStockThresholdQty: "",
    lowStockThresholdWeight: "",
    outletId: "",
    quantity: "",
    weight: "",
    user: "",
  });

  const [product, setProduct] = useState<{
    name: string;
    weighted: boolean;
  } | null>(null);

  const [isClient, setIsClient] = useState(false);

  const [loadingProduct, setLoadingProduct] = useState(false);
  const [productError, setProductError] = useState("");
  const [errors, setErrors] = useState({
    barcode: "",
    lowStockThresholdQty: "",
    lowStockThresholdWeight: "",
    outletId: "",
    quantity: "",
    weight: "",
  });
  const fetchRequestId = useRef(0);
  const barcodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  //Determine if barcode is enterd, if product is weighted
  const isBarcodeEntered = formData.barcode !== "";
  const isProductLoaded = product !== null;
  const weighted = product?.weighted;
  const disableQty = !isBarcodeEntered || !isProductLoaded || weighted;
  const disableWeight = !isBarcodeEntered || !isProductLoaded || !weighted;

  // hydration fix
  const updateIsClient = useEffectEvent((val: boolean) => {
    setIsClient(val);
  });

  useEffect(() => {
    updateIsClient(true);
  }, []);

  const updateFormData = useEffectEvent((data: StockRequest) => {
    setFormData(data);
  });

  const updateErrors = useEffectEvent((errors: StockFormErrors) => {
    setErrors(errors);
  });

  const loadProduct = async (barcode: string) => {
    if (!barcode || barcode.length < 13) return;

    const requestId = ++fetchRequestId.current;

    try {
      setLoadingProduct(true);
      setProductError("");
      setProduct(null);
      const data = await fetchProduct(barcode);

      if (requestId !== fetchRequestId.current) return;

      setProduct({
        name: data.name,
        weighted: data.weighted,
      });
    } catch (err) {
      if (requestId !== fetchRequestId.current) return;
      console.error(err);
      setProductError("Product not found");
      setProduct(null);
    } finally {
      if (requestId === fetchRequestId.current) {
        setLoadingProduct(false);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    //Clear Errors While Typing
    setErrors((prev) => ({
      ...prev,
      [id]: "",
    }));

    if (id === "barcode") {
      setProduct(null);
      setProductError("");
      fetchRequestId.current++;

      if (barcodeDebounceRef.current) {
        clearTimeout(barcodeDebounceRef.current);
      }

      if (value.length >= 13) {
        barcodeDebounceRef.current = setTimeout(() => {
          loadProduct(value);
        }, 400);
      }
    }
  };

  const handleAddStock = async (data: FormData) => {
    const user = getUserFromToken();

    if (!user || !user.role) {
      alert("User not logged in");
      return;
    }
    const stock: StockRequest = {
      barcode: data.get("barcode") as number | "",
      lowStockThresholdQty:
        parseInt(data.get("lowStockThresholdQty") as string) || 0,
      lowStockThresholdWeight:
        parseFloat(data.get("lowStockThresholdWeight") as string) || 0,
      outletId: (data.get("outletId") as string) || "",
      quantity: parseFloat(data.get("quantity") as string) || 0,
      weight: parseFloat(data.get("weight") as string) || 0,
      user: user.role,
    };
    // if (!stock.barcode || !stock.outletId) {
    //   alert("Please fill in all required fields with valid values.");
    //   return;
    // }

    const newStock = {
      barcode: stock.barcode,
      lowStockThresholdQty: stock.lowStockThresholdQty,
      lowStockThresholdWeight: stock.lowStockThresholdWeight,
      outletId: stock.outletId,
      quantity: stock.quantity,
      weight: stock.weight,
      user: stock.user,
    };

    const result = stockSchema.safeParse({
      barcode: formData.barcode,
      outletId: formData.outletId,
      quantity: Number(formData.quantity),
      weight: Number(formData.weight),
      lowStockThresholdQty: Number(formData.lowStockThresholdQty),
      lowStockThresholdWeight: Number(formData.lowStockThresholdWeight),
      weighted: product?.weighted ?? false,
    });

    if (!result.success) {
      console.log(result.error.flatten());

      const errors = result.error.flatten().fieldErrors;

      setErrors({
        barcode: errors.barcode?.[0] || "",
        lowStockThresholdQty: errors.lowStockThresholdQty?.[0] || "",
        lowStockThresholdWeight: errors.lowStockThresholdWeight?.[0] || "",
        outletId: errors.outletId?.[0] || "",
        quantity: errors.quantity?.[0] || "",
        weight: errors.weight?.[0] || "",
      });

      return;
    }

    try {
      await addStock(newStock);

      setFormData({
        barcode: "",
        lowStockThresholdQty: "",
        lowStockThresholdWeight: "",
        outletId: "",
        quantity: "",
        weight: "",
        user: stock.user,
      });
      alert("Stock added successfully!");
      onAddSuccess?.();
      setProduct(null);
      setProductError("");
      // setErrors({
      //   barcode: "",
      //   lowStockThresholdQty: "",
      //   lowStockThresholdWeight: "",
      //   outletId: "",
      //   quantity: "",
      //   weight: "",
      // });
      onClose();
    } catch (err) {
      console.error("Failed to add stock:", err);
      alert("Failed to add Stock");
    }
  };
  useEffect(() => {
    if (isOpen)
      updateFormData({
        barcode: "",
        lowStockThresholdQty: "",
        lowStockThresholdWeight: "",
        outletId: "",
        quantity: "",
        weight: "",
        user: "",
      });
    updateErrors({
      barcode: "",
      lowStockThresholdQty: "",
      lowStockThresholdWeight: "",
      outletId: "",
      quantity: "",
      weight: "",
    });
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (barcodeDebounceRef.current) {
        clearTimeout(barcodeDebounceRef.current);
      }
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    isClient && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div
          className="bg-white px-4 sm:px-6 py-4 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-red-950 text-xl font-bold mb-4">{heading}</h2>
          <Form
            action={handleAddStock}
            className="flex rounded font-medium text-red-950 flex-col gap-2 flex-wrap text-xs"
          >
            {/* barcode */}
            <label htmlFor="barcode">Barcode *</label>
            <input
              id="barcode"
              name="barcode"
              placeholder="Barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full bg-red-50 p-2 text-md text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
            />
            {errors.barcode && (
              <p className="text-red-500 text-xs">{errors.barcode}</p>
            )}
            {loadingProduct && (
              <p className="text-blue-500 text-xs">Loading product info...</p>
            )}
            {productError && (
              <p className="text-red-500 text-xs">{productError}</p>
            )}
            {product && (
              <p className="text-green-600 text-xs">
                {product.name} ({product.weighted ? "Weighted" : "Unit"})
              </p>
            )}
            <label htmlFor="outletId">Select Outlet*</label>
            <select
              id="outletId"
              name="outletId"
              value={formData.outletId === "" ? "" : String(formData.outletId)}
              onChange={handleChange}
              className="w-full bg-red-50 p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
            >
              <option value="" hidden>
                Select Outlet
              </option>
              <option value="Katunayake">Katunayake</option>
              {/* <option value="outlet2">Outlet 2</option> */}
            </select>
            {errors.outletId && (
              <p className="text-red-500 text-xs">{errors.outletId}</p>
            )}

            {/* Quantity */}
            <label htmlFor="quantity">Quantity *</label>
            <input
              id="quantity"
              type="number"
              name="quantity"
              placeholder="Quantity"
              disabled={disableQty}
              value={formData.quantity}
              // min={0}
              onChange={handleChange}
              className={`w-full ${disableQty ? "bg-gray-200" : "bg-red-50"} p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs">{errors.quantity}</p>
            )}

            {/* Weight */}
            <label htmlFor="weight">Weight *</label>
            <input
              id="weight"
              type="number"
              name="weight"
              placeholder="Weight"
              disabled={disableWeight}
              step={0.01}
              min={0}
              value={formData.weight}
              onChange={handleChange}
              className={`w-full ${disableWeight ? "bg-gray-200" : "bg-red-50"} p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.weight && (
              <p className="text-red-500 text-xs">{errors.weight}</p>
            )}

            {/* Low Stock Threshold (Qty) */}
            <label htmlFor="lowStockThresholdQty">
              Low Stock Threshold (Qty) *
            </label>
            <input
              id="lowStockThresholdQty"
              type="number"
              name="lowStockThresholdQty"
              placeholder="Low Stock Threshold (Qty)"
              disabled={disableQty}
              min={20}
              value={formData.lowStockThresholdQty}
              onChange={handleChange}
              className={`w-full ${disableQty ? "bg-gray-200" : "bg-red-50"} p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.lowStockThresholdQty && (
              <p className="text-red-500 text-xs">
                {errors.lowStockThresholdQty}
              </p>
            )}

            {/* Low Stock Threshold (Weight) */}
            <label htmlFor="lowStockThresholdWeight">
              Low Stock Threshold (Weight) *
            </label>
            <input
              id="lowStockThresholdWeight"
              type="number"
              name="lowStockThresholdWeight"
              placeholder="Low Stock Threshold (Weight)"
              step={0.01}
              min={20}
              value={formData.lowStockThresholdWeight}
              disabled={disableWeight}
              onChange={handleChange}
              className={`w-full ${disableWeight ? "bg-gray-200" : "bg-red-50"} p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.lowStockThresholdWeight && (
              <p className="text-red-500 text-xs">
                {errors.lowStockThresholdWeight}
              </p>
            )}
            <div className="flex flex-col items-center  sm:flex-row  md:items-center sm:items-center justify-center gap-2 mt-4">
              <button
                type="submit"
                className="px-8 py-2 w-1/2 text-white rounded transition bg-green-900 hover:bg-green-800"
              >
                Add
              </button>
              <Button
                onClick={() => {
                  setProduct(null);
                  setProductError("");
                  onClose();
                }}
                className="w-1/2 bg-red-600 hover:bg-red-500 rounded"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </div>
    )
  );
}
