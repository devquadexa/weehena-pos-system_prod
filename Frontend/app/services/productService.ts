import { Product } from "../types";
import { ProductItems, ProductRequest } from "../types/Product";

const API_URL = "https://weehenapos360.cloud/api/products";

// Get all products
export const getProducts = async (): Promise<ProductItems[]> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
};

// Add product
export const addProduct = async (product: ProductRequest) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to add product");
  return res.json();
};

// Delete product
export const deleteProduct = async (id: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete product");
};

// Fetch product by barcode
export const fetchProduct = async (barcode: string): Promise<Product> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/${barcode}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Product not found");

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
};
