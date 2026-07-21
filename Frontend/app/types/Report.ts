export interface reportData {
  date: string;
  outletId: string;
  discountAmount: number;
  totalSales: number;
  totalTransactions: number;
}

export interface SoldItemReport {
  barcode: string;
  itemName: string;
  saleQty: number;
  salePrice: number;
  saleValue: number;
  invoiceNo: string;
  status: string;
}

export interface DayEndStockReport {
  barcode: string;
  productName: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  closingStock: number;
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
