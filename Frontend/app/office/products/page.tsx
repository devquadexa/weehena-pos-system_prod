"use client";

import Button from "@/app/components/Button";
import PriceUpdateModal, { PriceForm } from "@/app/components/PriceUpdateModal";
import ProductForm from "@/app/components/ProductForm";
import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";
import {
  deleteProduct,
  getProducts,
  updateProductPrices,
} from "@/app/services/productService";
import { ProductItems } from "@/app/types/Product";
import { Trash2 } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function ProductPage() {
  const [products, setProducts] = useState<ProductItems[]>([]);

  const [formOpen, setFormOpen] = useState(false);

  const [search, setSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItems | null>(
    null,
  );

  // Load products from backend
  const loadProducts = async () => {
    try {
      const data = await getProducts();
      const sortedData = data.sort((a: ProductItems, b: ProductItems) =>
        a.barcode.toString().localeCompare(b.barcode.toString()),
      );
      setProducts(sortedData);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const updateLoadProducts = useEffectEvent(() => {
    loadProducts();
  });

  useEffect(() => {
    updateLoadProducts();
  }, []);

  // Delete product
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure to delete this product?");
    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Failed to delete product");
    }
  };

  

  const filteredProducts = products.filter(
    (item) =>
      item.barcode?.toString().includes(search) ||
      item.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const productColumns: ColumnDef<ProductItems>[] = [
    {
      header: "Barcode",
      render: (p) => p.barcode,
    },
    {
      header: "Product Name",
      render: (p) => p.name,
      cardRole: "title",
    },
    {
      header: "Bulk Price",
      align: "right",
      render: (p) => (
        <button
          onClick={() => handlePriceClick(p)}
          className="text-amber-800 text-right bg-amber-100 hover:bg-amber-200 w-full px-2 py-1 rounded"
        >
          {p.bulkPrice.toFixed(2)}
        </button>
      ),
    },
    {
      header: "Retail Price",
      align: "right",
      render: (p) => (
        <button
          onClick={() => handlePriceClick(p)}
          className="text-emerald-800 text-right bg-emerald-100 hover:bg-emerald-200 w-full px-2 py-1 rounded"
        >
          {p.retailPrice.toFixed(2)}
        </button>
      ),
    },
    {
      header: "Pack Price",
      align: "right",
      render: (p) => (
        <button
          onClick={() => handlePriceClick(p)}
          className="text-cyan-800 text-right bg-cyan-100 hover:bg-cyan-200 w-full px-2 py-1 rounded"
        >
          {p.packPrice ? p.packPrice.toFixed(2) : "N/A"}
        </button>
      ),
    },
    {
      header: "Price per Kg",
      align: "right",
      render: (p) => (
        <button
          onClick={() => handlePriceClick(p)}
          className="text-blue-800 text-right bg-blue-100 hover:bg-blue-200 w-full px-2 py-1 rounded"
        >
          {p.pricePerKg ? p.pricePerKg.toFixed(2) : "N/A"}
        </button>
      ),
    },
    {
      header: "Action",
      align: "center",
      cardRole: "actions",
      render: (p) => (
        <button
          onClick={() => handleDelete(p.id)}
          className="w-full lg:w-fit rounded text-red-800 hover:text-red-600 hover:bg-red-100 px-2 py-1 "
        >
         <Trash2 className="size-4 items-center mx-auto" />
        </button>
      ),
    },
  ];

  const handlePriceUpdate = async (prices: PriceForm) => {
    if (!selectedProduct) return;

    const confirmUpdate = confirm(
      `Are you sure to update prices of ${selectedProduct.name}?`,
    );
    if (!confirmUpdate) return;

    try {
      await updateProductPrices({
        barcode: selectedProduct.barcode,
        ...prices,
      });

      await loadProducts();

      setPriceModalOpen(false);
      setSelectedProduct(null);
      toast.success(`${selectedProduct.name} prices updated successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update prices");
    }
  };

  const handlePriceClick = (product: ProductItems) => {
    setSelectedProduct(product);
    setPriceModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0">
      <h1 className="text-lg sm:text-xl text-red-950 font-bold mb-4 shrink-0">
        Product Management
      </h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 text-xs shrink-0">
        <input
          id="search"
          placeholder="Search by barcode or product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border font-medium w-full sm:max-w-xs border-gray-300 text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
        />
        <Button
          onClick={() => setFormOpen(true)}
          className="w-full sm:w-auto shrink-0 bg-green-900 hover:bg-green-700"
        >
          Add Product
        </Button>

        <ProductForm
          isOpen={formOpen}
          onClose={() => {
            setFormOpen(false);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
          }}
          onAddSuccess={() => loadProducts()}
          heading="Add New Product"
        />

        {selectedProduct && (
          <PriceUpdateModal
            isOpen={priceModalOpen}
            onClose={() => {
              setPriceModalOpen(false);
              setSelectedProduct(null);
            }}
            heading="Update Prices"
            productName={selectedProduct.name}
            weighted={selectedProduct.weighted}
            initialValues={{
              bulkPrice: selectedProduct.bulkPrice,
              retailPrice: selectedProduct.retailPrice,
              packPrice: selectedProduct.packPrice,
              pricePerKg: selectedProduct.pricePerKg,
            }}
            onConfirm={handlePriceUpdate}
          />
        )}
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveDataView
          data={filteredProducts}
          columns={productColumns}
          getRowKey={(p) => p.id}
          emptyMessage="No products match your search"
          scrollable
        />
      </div>
    </div>
  );
}
