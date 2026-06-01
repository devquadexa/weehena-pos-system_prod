export interface reportData {
  date: string;
  outletId: string;
  discountAmount: number,
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