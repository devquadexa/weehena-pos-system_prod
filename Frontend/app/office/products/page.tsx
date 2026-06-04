"use client";

import Button from "@/app/components/Button";
import ProductForm from "@/app/components/ProductForm";
import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";
import { deleteProduct, getProducts } from "@/app/services/productService";
import { ProductItems } from "@/app/types/Product";
import { useEffect, useEffectEvent, useRef, useState } from "react";

export default function ProductPage() {
  const [products, setProducts] = useState<ProductItems[]>([]);

  const [formOpen, setFormOpen] = useState(false);

  const [search, setSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

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
      alert("Failed to delete product");
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
      render: (p) => p.bulkPrice.toFixed(2),
    },
    {
      header: "Retail Price",
      align: "right",
      render: (p) => p.retailPrice.toFixed(2),
    },
    {
      header: "Pack Price",
      align: "right",
      render: (p) => (p.packPrice ? p.packPrice.toFixed(2) : "N/A"),
    },
    {
      header: "Price per Kg",
      align: "right",
      render: (p) => (p.pricePerKg ? p.pricePerKg.toFixed(2) : "N/A"),
    },
    {
      header: "Action",
      align: "center",
      cardRole: "actions",
      render: (p) => (
        <Button
          onClick={() => handleDelete(p.id)}
          className="w-full bg-red-900 hover:bg-red-700 text-white rounded"
        >
          Delete
        </Button>
      ),
    },
  ];

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
