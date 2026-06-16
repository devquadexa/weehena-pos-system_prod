"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Form from "next/form";
import { addProduct } from "../services/productService";
import Button from "./Button";
import { ProductRequest } from "../types/Product";
import { productSchema, ProductSchema } from "../schemas/productSchema";
import z from "zod/v4";
import toast from "react-hot-toast";

type ProductFormErrors = {
  barcode: string;
  name: string;
  weighted: string;
  bulkPrice: string;
  retailPrice: string;
  packPrice: string;
  pricePerKg: string;
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
  const [formData, setFormData] = useState<ProductRequest>({
    barcode: "",
    name: "",
    bulkPrice: "",
    retailPrice: "",
    packPrice: "",
    pricePerKg: "",
    weighted: "",
  });
  const [isClient, setIsClient] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductSchema, string>>
  >({});

  // Determine if product type is selected and if it's weighted
  const isTypeSelected = formData.weighted !== "";
  const isWeighted = formData.weighted === true;

  // hydration fix
  const updateIsClient = useEffectEvent((val: boolean) => {
    setIsClient(val);
  });

  useEffect(() => {
    updateIsClient(true);
  }, []);

  const updateFormData = useEffectEvent((data: ProductRequest) => {
    setFormData(data);
  });

  const updateErrors = useEffectEvent((errors: ProductFormErrors) => {
    setErrors(errors);
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      if (id === "weighted") {
        const parsedValue = value === "" ? "" : value === "true";

        return {
          ...prev,
          weighted: parsedValue,
          bulkPrice: "",
          retailPrice: "",
          packPrice: "",
          pricePerKg: "",
        };
      }

      //Clear Errors While Typing
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));

      // Handle price fields
      if (
        ["bulkPrice", "retailPrice", "packPrice", "pricePerKg"].includes(id)
      ) {
        return {
          ...prev,
          [id]: value === "" ? "" : parseFloat(value),
        };
      }

      // Default
      return {
        ...prev,
        [id]: value,
      };
    });
  };

  const handleAddProduct = async (data: FormData) => {
    const product: ProductRequest = {
      barcode: data.get("barcode") as number | "",
      name: data.get("name") as string,
      bulkPrice: parseFloat(data.get("bulkPrice") as string) || 0,
      retailPrice: parseFloat(data.get("retailPrice") as string) || 0,
      packPrice: parseFloat(data.get("packPrice") as string) || 0,
      pricePerKg: parseFloat(data.get("pricePerKg") as string) || 0,
      weighted: (data.get("weighted") as string) === "true",
    };
    // if (
    //   !product.name ||
    //   !product.barcode ||
    //   !product.bulkPrice ||
    //   !product.retailPrice
    // ) {
    //   alert("Please fill in all required fields with valid values.");
    //   return;
    // }

    const newProduct = {
      name: product.name,
      barcode: product.barcode,
      bulkPrice: product.bulkPrice,
      retailPrice: product.retailPrice,
      packPrice: product.packPrice,

      pricePerKg: product.pricePerKg,
      weighted: product.weighted,
    };

    const result = productSchema.safeParse({
      barcode: data.get("barcode"),
      name: data.get("name"),
      weighted:
        data.get("weighted") === "" ? "" : data.get("weighted") === "true",
      bulkPrice: data.get("bulkPrice"),
      retailPrice: data.get("retailPrice"),
      packPrice: data.get("packPrice"),
      pricePerKg: data.get("pricePerKg"),
    });

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);

      setErrors({
        barcode: fieldErrors.barcode?.[0] || "",
        name: fieldErrors.name?.[0] || "",
        weighted: fieldErrors.weighted?.[0] || "",
        bulkPrice: fieldErrors.bulkPrice?.[0] || "",
        retailPrice: fieldErrors.retailPrice?.[0] || "",
        packPrice: fieldErrors.packPrice?.[0] || "",
        pricePerKg: fieldErrors.pricePerKg?.[0] || "",
      });

      return;
    }

    try {
      await addProduct(newProduct);

      setFormData({
        barcode: "",
        name: "",
        bulkPrice: 0,
        retailPrice: 0,
        packPrice: 0,
        pricePerKg: 0,
        weighted: false,
      });
      // alert("Product added successfully!");
      toast.success(`${product.name} added successfully!`);
      onAddSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to add product:", err);
      // alert("Failed to add product");
      toast.error("Failed to add product");
    }
  };
  useEffect(() => {
    if (isOpen)
      updateFormData({
        barcode: "",
        name: "",
        bulkPrice: "",
        retailPrice: "",
        packPrice: "",
        pricePerKg: "",
        weighted: "",
      });
    updateErrors({
      barcode: "",
      name: "",
      weighted: "",
      bulkPrice: "",
      retailPrice: "",
      packPrice: "",
      pricePerKg: "",
    });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    isClient && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div
          className="bg-white px-4 sm:px-6 py-4 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-red-950 text-xl font-bold mb-4">{heading}</h2>
          <Form
            action={handleAddProduct}
            className="flex rounded font-medium text-red-950 flex-col gap-2 flex-wrap text-xs"
          >
            <label htmlFor="weighted">Select Product Type *</label>
            <select
              id="weighted"
              name="weighted"
              value={formData.weighted === "" ? "" : String(formData.weighted)}
              onChange={handleChange}
              className="w-full bg-red-50 p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
            >
              <option value="">Select Product Type</option>
              <option value="false">Sausage Product</option>
              <option value="true">Chicken Product</option>
            </select>
            {errors.weighted && (
              <p className="text-red-500 text-xs">{errors.weighted}</p>
            )}

            {/* barcode */}
            <label htmlFor="barcode">Barcode *</label>
            <input
              id="barcode"
              name="barcode"
              type="number"
              placeholder="Barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full bg-red-50 p-2 text-md text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
            />
            {errors.barcode && (
              <p className="text-red-500 text-xs">{errors.barcode}</p>
            )}

            {/* Product name */}
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="false"
              className="w-full bg-red-50 p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}

            {/* Bulk Price */}
            <label htmlFor="bulkPrice">Bulk Price (LKR) *</label>
            <input
              id="bulkPrice"
              type="number"
              name="bulkPrice"
              placeholder="Bulk Price"
              disabled={!isTypeSelected}
              step={0.01}
              // min={0}
              value={formData.bulkPrice}
              onChange={handleChange}
              className={`w-full ${!isTypeSelected ? "bg-gray-200" : "bg-red-50"} p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.bulkPrice && (
              <p className="text-red-500 text-xs">{errors.bulkPrice}</p>
            )}

            {/* Retail Price */}
            <label htmlFor="retailPrice">Retail Price (LKR) *</label>
            <input
              id="retailPrice"
              type="number"
              name="retailPrice"
              placeholder="Retail Price"
              disabled={!isTypeSelected}
              step={0.01}
              min={0}
              value={formData.retailPrice}
              onChange={handleChange}
              className={`w-full ${!isTypeSelected ? "bg-gray-200" : "bg-red-50"} p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.retailPrice && (
              <p className="text-red-500 text-xs">{errors.retailPrice}</p>
            )}

            {/* Pack Price */}
            <label htmlFor="packPrice">Pack Price (LKR) *</label>
            <input
              id="packPrice"
              type="number"
              name="packPrice"
              placeholder="Pack Price"
              disabled={!isTypeSelected || isWeighted}
              step={0.01}
              min={0}
              value={formData.packPrice}
              onChange={handleChange}
              className={`w-full ${!isTypeSelected || isWeighted ? "bg-gray-200" : "bg-red-50"} p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.packPrice && (
              <p className="text-red-500 text-xs">{errors.packPrice}</p>
            )}

            {/* Price Per Kg */}
            <label htmlFor="pricePerKg">Price per Kg (LKR) *</label>
            <input
              id="pricePerKg"
              type="number"
              name="pricePerKg"
              placeholder="Price per Kg"
              step={0.01}
              min={0}
              value={formData.pricePerKg}
              disabled={!isTypeSelected || !isWeighted}
              onChange={handleChange}
              className={`w-full ${!isTypeSelected || !isWeighted ? "bg-gray-200" : "bg-red-50"} p-2 text-gray-700 text-md border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800`}
            />
            {errors.pricePerKg && (
              <p className="text-red-500 text-xs">{errors.pricePerKg}</p>
            )}

            <div className="flex justify-center gap-2 mt-4">
              <button
                type="submit"
                className="px-8 py-2 w-1/2 text-white rounded transition bg-green-900 hover:bg-green-700"
              >
                Add
              </button>
              <Button
                onClick={onClose}
                className="w-1/2 bg-red-500 hover:bg-red-600 rounded"
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
