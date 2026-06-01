"use client";

import Button from "@/app/components/Button";
import ProductForm from "@/app/components/ProductForm";
import {
  deleteProduct,
  getProducts,
} from "@/app/services/productService";
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

  return (
    <div className="">
      <h1 className="text-xl text-red-950 font-bold mb-4">
        Product Management
      </h1>

      <div className="relative rounded mb-4 flex gap-2 flex-wrap text-xs">
        <input
          id="search"
          placeholder="Search by barcode or product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 mb-2 border font-medium w-60  border-gray-300 text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
        />
        <Button
          onClick={() => setFormOpen(true)}
          className="absolute right-0 bg-green-900 hover:bg-green-700"
        >
          Add Product
        </Button>

        {/* Product Form Modal */}
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

      <table className="w-full border border-gray-300 text-xs">
        <thead>
          <tr className="bg-red-50">
            <th className="text-red-900 text-left p-2 w-50">Barcode</th>
            <th className="text-red-900 text-left p-2 w-100">Product Name</th>
            <th className="text-red-900 text-right p-2 w-30">Bulk Price</th>
            <th className="text-red-900 text-right p-2 w-30">Retail Price</th>
            <th className="text-red-900 text-right p-2 w-30">Pack Price</th>
            <th className="text-red-900 text-right p-2 w-30">Price per Kg</th>
            <th className="text-red-900 p-2 w-fit ">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id} className="odd:bg-white even:bg-gray-100">
              <td className=" text-gray-950 font-medium p-2">{p.barcode}</td>
              <td className="text-gray-950 font-medium p-2">{p.name}</td>
              <td className="text-gray-950 font-medium p-2 text-right">
                {p.bulkPrice.toFixed(2)}
              </td>
              <td className="text-gray-950 font-medium p-2 text-right">
                {p.retailPrice.toFixed(2)}
              </td>
              <td className="text-gray-950 font-medium p-2 text-right">
                {p.packPrice ? p.packPrice.toFixed(2) : "N/A"}
              </td>
              <td className="text-gray-950 font-medium p-2 text-right">
                {p.pricePerKg ? p.pricePerKg.toFixed(2) : "N/A"}
              </td>
              <td className="text-gray-950 font-medium p-2 text-right">
                <Button
                  onClick={() => handleDelete(p.id)}
                  className=" bg-red-900 hover:bg-red-700 text-white rounded"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
