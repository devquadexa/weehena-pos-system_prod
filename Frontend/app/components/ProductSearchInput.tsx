import { useRef, useEffect } from "react";
import { Product } from "../types/Product";
import { Search } from "lucide-react";

interface ProductSearchInputProps {
  searchTerm: string;
  setSearchTerm: (name: string) => void;
  results: Product[];
  loading: boolean;
  onSelect: (product: Product) => void;
}

export default function ProductSearchInput({
  searchTerm,
  setSearchTerm,
  results,
  loading,
  onSelect,
}: ProductSearchInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSearchTerm]);

  return (
    <div ref={containerRef} className="relative  w-full mt-4">
      {/* Input */}
      <div className="flex gap-2 items-center border-2  px-3 py-2 h-10 bg-white border-gray-300 rounded  shadow-sm focus-within:ring-2 focus-within:ring-red-900">
        {/* Search icon */}
        <Search className="size-5 text-red-950 font-semibold" />

        <input
          id="searchProduct"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search product by name..."
          className="w-full text-black text-base outline-none bg-transparent"
        />

        {/* Spinner */}
        {loading && (
          <svg
            className="animate-spin w-4 h-4 text-blue-500 ml-2 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}

        {/* Clear button */}
        {searchTerm && !loading && (
          <button
            onClick={() => setSearchTerm("")}
            className="ml-2 font-bold text-gray-400 hover:text-gray-600 shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {searchTerm && (
        <ul className="absolute z-50 mt-1 w-full bg-white border-2 border-red-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.length === 0 && !loading ? (
            <li className="px-4 py-3 text-sm font-semibold text-red-800 text-center">
              No products found
            </li>
          ) : (
            results.map((product) => (
              <li
                key={product.barcode}
                onClick={() => onSelect(product)}
                className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-red-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs font-medium text-red-700">{product.barcode}</p>
                </div>
                <span className="text-red-800 font-semibold">
                  {product.retailPrice.toFixed(2)}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
