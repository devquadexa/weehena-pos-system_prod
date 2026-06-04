import { SaleData } from "../types/Sale";

const API_URL = "https://weehenapos360.cloud/api/sales";

export const processSale = async (saleData: SaleData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(saleData),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Sale failed");
  }

  return response.text();
};

export const cancelLastSale = async () => {
  const res = await fetch(`${API_URL}/cancel-last-sale`, {
    method: "PUT",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to cancel sale");
  }

  return res.json();
};
