import { SaleData } from "../types/Sale";

const API_URL = "https://weehenapos360.cloud/api/sales";

export const processSale = async (saleData: SaleData) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(saleData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Sale failed");
  }
  console.log(saleData);
  return res.text();
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
