export interface reportData {
  date: string;
  outletId: string;
  discountAmount: number;
  totalSales: number;
  totalTransactions: number;
}

export interface SoldItemReport {
  invoiceNo: string;
  itemName: string;
  barcode: string;
  saleQty: number;
  salePrice: number;
  saleValue: number;
  weighted: boolean;
  status: string;
}

export interface StockReport {
  barcode: string;
  productName: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  closingStock: number;
  weighted: boolean;
}
export interface DayEndStockReport {
  weightedItems: StockReport[];
  nonWeightedItems: StockReport[];
}

export interface CategoryReport {
  items: SoldItemReport[];
  totalValue: number;
  totalQty: number;
}

export interface NonWeightedReport {
  retail: CategoryReport;
  bulk: CategoryReport;
  totalValue: number;
  totalQty: number;
}

export interface SoldItemsReportResponse {
  weighted: CategoryReport;
  nonWeighted: NonWeightedReport;
  grandTotal: number;
}

export type MonthlyStockRow = {
  barcode: string;
  productName: string;
  weighted: boolean;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  closingStock: number;
};

export type MonthlyDailySales = {
  date: string;
  saleCount: number;
  revenue: number;
};

export type MonthlyProductSales = {
  barcode: string;
  productName: string;
  weighted: boolean;
  priceType: string;
  quantity: number;
  revenue: number;
};

export type MonthlyReport = {
  outletId: string;
  month: string;
  summary: {
    totalSales: number;
    totalDiscount: number;
    totalTransactions: number;
    cancelledCount: number;
    averageSale: number;
  };
  daily: MonthlyDailySales[];
  products: MonthlyProductSales[];
  stock: {
    weightedItems: MonthlyStockRow[];
    nonWeightedItems: MonthlyStockRow[];
  };
};