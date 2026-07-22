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
