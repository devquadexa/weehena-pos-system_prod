import {
  Product,
  ProductItems,
  ProductRequest,
  UpdatePriceRequest,
} from "../types/Product";

const API_URL = "https://weehenapos360.cloud/api/products";

//Local DB
// const API_URL = "http://localhost:8080/api/products";

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

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to add product");
  }
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

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Product not found");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
};

//Update Product Prices
export const updateProductPrices = async (body: UpdatePriceRequest) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/prices`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return res.json();
};

//Get product by name
export const fetchProductsByName = async (name: string): Promise<Product[]> => {
  const response = await fetch(
    `${API_URL}/search?name=${name}`,
  );

  if (!response.ok) {
    throw new Error("Failed to search products");
  }

  return response.json();
};
