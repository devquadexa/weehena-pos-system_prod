import { StockItem, StockRequest, StockUpdateRequest } from "../types/Stock";

const API_URL = "http://localhost:8080/api/stock";

// Get all stock
export const getStock = async (): Promise<StockItem[]> => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch stock");
  return res.json();
};

// Add stock Omit<StockItem, "id"
export const addStock = async (stock: StockRequest) => {
  const token = localStorage.getItem("token");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(stock),
  });
  if (!res.ok) throw new Error("Failed to add stock");
  return res.json();
};

export const updateStock = async (id: number, body: StockUpdateRequest) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return res.json();
};

// Delete stock
export const deleteStock = async (id: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete stock");
};
