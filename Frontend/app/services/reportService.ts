import { DayEndStockReport, reportData, SoldItemReport } from "../types/Report";

const API_URL = "http://localhost:8080/api/reports";

export const getDailyReport = async (date: string, outletId: string): Promise<reportData[]> => {
  const url = `${API_URL}/daily?date=${date}&outletId=${outletId}`;

  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch report");
  }

  return res.json();
};

export const getSoldItems = async (
  date: string,
  outletId: string,
): Promise<SoldItemReport[]> => {
  const url = `${API_URL}/items?date=${date}&outletId=${outletId}`;

  // if (outletId && outletId !== "") {
  //   url += `&outletId=${outletId}`;
  // }

  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch sold items");
  }

  return res.json();
};

//Day End Stock Report
export const getDayEndStockReport = async (date: string, outletId: string): Promise<DayEndStockReport[]> => {
  const url = `${API_URL}/day-end-stock?date=${date}&outletId=${outletId}`;

  // if (outletId && outletId !== "") {
  //   url += `&outletId=${outletId}`;
  // }

  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch day-end stock report");
  }

  return res.json();
};
